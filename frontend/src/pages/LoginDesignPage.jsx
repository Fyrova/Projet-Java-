import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getIcon } from '../lib/iconMap'
import logo from '../assets/hero.png'

import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../api/http'

export default function LoginDesignPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const EyeIcon = getIcon('eye')
  const EyeOffIcon = getIcon('eyeOff')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSupportMessage('')

    if (!form.email || !String(form.email).includes('@')) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }

    if (!form.password || String(form.password).length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres.')
      return
    }

    try {
      const nextUser = await login({ email: form.email, motDePasse: form.password })
      const fallbackPath = nextUser?.role === 'Etudiant' ? '/matieres' : '/'
      navigate(location.state?.from?.pathname ?? fallbackPath, { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  if (isAuthenticated) return null

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-left">
            <div className="login-left-inner">
              <h1 className="login-main-title">BIENVENUE</h1>
              <p className="login-left-subtitle">Votre portail de gestion EMIT</p>

              <div className="login-logo-container">
                <img className="login-logo" src={logo} alt="Logo EMIT" />
              </div>

              <h2 className="login-brand-title">Gestion EMIT</h2>
              <p className="login-left-description">Accédez à votre espace administrateur, professeur ou étudiant</p>

              <div className="login-decorative-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-form-container">
              <h3 className="login-form-title">Se connecter</h3>
              <p className="login-form-subtitle">Entrez vos identifiants</p>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="email" className="form-label">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="password" className="form-label">
                    Mot de passe
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      className="form-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                </div>

                {error && <div className="form-error-message">{error}</div>}
                {supportMessage && <div className="form-success-message">{supportMessage}</div>}

                <button type="submit" className="login-submit-btn" disabled={isLoading}>
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </form>

              <div className="login-footer">
                <p className="login-footer-text">
                  Problème de connexion ?{' '}
                  <button
                    type="button"
                    className="login-help-link"
                    onClick={() =>
                      setSupportMessage(
                        'Pour réinitialiser votre mot de passe, contactez l'administration EMIT.',
                      )
                    }
                  >
                    Contacter le support
                  </button>
                </p>

                <p className="login-footer-text">
                  Pas encore inscrit ?{' '}
                  <button type="button" className="login-help-link" onClick={() => navigate('/signup')}>
                    S'inscrire
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


