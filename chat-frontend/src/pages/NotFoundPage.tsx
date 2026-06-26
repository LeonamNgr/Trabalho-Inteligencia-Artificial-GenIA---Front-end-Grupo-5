import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p>Página não encontrada</p>
      <Link to="/" className={styles.link}>Voltar para o início</Link>
    </div>
  );
}
