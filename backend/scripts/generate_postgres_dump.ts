
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de conexión MySQL (Lee desde .env)
const mysqlConfig = {
    host: process.env.DB_MYSQL_HOST || 'localhost',
    port: parseInt(process.env.DB_MYSQL_PORT || '3306'),
    user: process.env.DB_MYSQL_USER || 'root',
    password: process.env.DB_MYSQL_PASSWORD || '',
    database: process.env.DB_MYSQL_DATABASE || 'mobzi',
};

const OUTPUT_FILE = path.join(__dirname, '../../data_dump_postgres.sql');

async function exportData() {
    console.log('🔌 Conectando a MySQL local...');
    console.log(`   Host: ${mysqlConfig.host}`);
    console.log(`   DB: ${mysqlConfig.database}`);

    let connection;
    try {
        connection = await mysql.createConnection(mysqlConfig);
        console.log('✅ Conectado.');

        const tables = ['municipios', 'empresas', 'rutas', 'paradas', 'horarios'];
        let sqlContent = '-- MOBZI Data Dump for PostgreSQL\n-- Generated automatically\n\n';

        for (const table of tables) {
            console.log(`📦 Exportando tabla: ${table}...`);
            const [rows] = await connection.query(`SELECT * FROM ${table}`);
            
            if (Array.isArray(rows) && rows.length > 0) {
                sqlContent += `-- Data for ${table}\n`;
                
                // Generar INSERTs
                for (const row of rows as any[]) {
                    const columns = Object.keys(row);
                    const values = Object.values(row).map((val: any, index) => {
                        const colName = columns[index].toLowerCase();
                        const booleanCols = ['activo', 'activa', 'favorita', 'notificaciones', 'mostrar_favoritas'];

                        if (val === null) return 'NULL';
                        
                        // Forzar conversión a booleano de Postgres para columnas conocidas
                        if (booleanCols.includes(colName)) {
                            return val ? 'TRUE' : 'FALSE';
                        }

                        if (typeof val === 'number') return val;
                        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                        if (val instanceof Date) return `'${val.toISOString()}'`; // Postgres acepta ISO
                        if (typeof val === 'object') return `'${JSON.stringify(val)}'`; // JSON fields
                        // Escapar comillas simples
                        return `'${String(val).replace(/'/g, "''")}'`;
                    });

                    sqlContent += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
                }
                sqlContent += '\n';
            }
        }

        fs.writeFileSync(OUTPUT_FILE, sqlContent);
        console.log(`\n🎉 Exportación completada!`);
        console.log(`📄 Archivo generado: ${OUTPUT_FILE}`);
        console.log(`👉 Ahora puedes ejecutar este script SQL en tu base de datos Neon/PostgreSQL después de crear las tablas.`);

    } catch (error) {
        console.error('❌ Error durante la exportación:', error);
        console.error('   Asegúrate de que tus credenciales en .env son correctas y tu MySQL está corriendo.');
    } finally {
        if (connection) await connection.end();
    }
}

exportData();
