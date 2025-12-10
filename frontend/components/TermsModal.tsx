import React from 'react';
import styles from './TermsModal.module.css';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Términos y Condiciones</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <h3>1. Aceptación de los Términos</h3>
          <p>
            Bienvenido a MOBZI. Al acceder y utilizar nuestra plataforma, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, te recomendamos no utilizar nuestros servicios.
          </p>

          <h3>2. Descripción del Servicio</h3>
          <p>
            MOBZI es una plataforma informativa diseñada para facilitar la búsqueda y visualización de rutas de transporte público en el estado de Tlaxcala. Proporcionamos información sobre itinerarios, paradas, empresas de transporte y costos estimados.
          </p>

          <h3>3. Exactitud de la Información</h3>
          <p>
            Aunque nos esforzamos por mantener la información actualizada y precisa:
          </p>
          <ul>
            <li>Los horarios, rutas y tarifas son referenciales y pueden estar sujetos a cambios sin previo aviso por parte de las empresas de transporte.</li>
            <li>MOBZI no garantiza la exactitud absoluta de los tiempos de llegada o la disponibilidad de las unidades en tiempo real.</li>
            <li>No nos hacemos responsables por inconvenientes derivados de cambios imprevistos en el servicio de transporte.</li>
          </ul>

          <h3>4. Cuenta de Usuario</h3>
          <p>
            Al crear una cuenta en MOBZI:
          </p>
          <ul>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>Te comprometes a proporcionar información veraz y actualizada.</li>
            <li>Eres responsable de todas las actividades que ocurran bajo tu cuenta.</li>
          </ul>

          <h3>5. Privacidad y Datos</h3>
          <p>
            Respetamos tu privacidad. Recopilamos información básica para mejorar tu experiencia, como tu historial de búsquedas y rutas guardadas. No compartimos tu información personal con terceros sin tu consentimiento, salvo cuando sea requerido por ley.
          </p>

          <h3>6. Uso Aceptable</h3>
          <p>
            Te comprometes a utilizar la plataforma de manera legal y ética. Queda prohibido intentar acceder sin autorización a nuestros sistemas, interferir con el funcionamiento de la aplicación o utilizarla para fines ilícitos.
          </p>

          <h3>7. Modificaciones</h3>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
          </p>
        </div>

        <div className={styles.footer}>
          <button className={styles.acceptButton} onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
