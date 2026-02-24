/**
 * SISTEMA DE INTERNACIONALIZACIÓN (i18n)
 * Manejo de idiomas y traducciones
 */

import { eventSystem } from './eventDelegation.js';
import { logEvent } from './errorHandler.js';

const DICTIONARY = {
  es: {
    app: {
      title: 'OASIS Ecosystem',
      loading: 'Sincronizando Ecosystem...',
      footer_version: 'v1.3.0 © 2026',
    },
    nav: {
      home: 'Inicio',
      peticiones: 'Peticiones',
      admin: 'Panel Admin',
      login: 'Iniciar Sesión',
      logout: 'Salir',
    },
    home: {
      hero_title: 'Bienvenidos',
      hero_subtitle: 'Más que una iglesia, una familia',
      cards: {
        peticiones: 'Peticiones',
        peticiones_desc: 'Comunidad',
        diezmos: 'Diezmos',
        diezmos_desc: 'Finanzas',
        recursos: 'Recursos',
        recursos_desc: 'Logística',
        leccion: 'Lección',
        leccion_desc: 'Estudio',
        certificados: 'Certificados',
        certificados_desc: 'Gestión',
      },
      carousel_load: 'Cargando anuncios...',
      no_anuncios: 'No hay anuncios en este momento',
      events_title: 'Próximos Eventos',
      no_events: 'No hay eventos programados próximamente',
      location_title: 'Encuéntranos',
      btn_maps: 'Ver en Google Maps',
      community: {
        comunidad: 'Comunidad',
        comunidad_desc: 'Conecta con hermanos y hermanas en fe',
        servicio: 'Servicio',
        servicio_desc: 'Nuestro propósito es servir y amar',
        crecimiento: 'Crecimiento',
        crecimiento_desc: 'Recursos para tu desarrollo espiritual',
        esperanza: 'Esperanza',
        esperanza_desc: 'Tu fe es nuestra inspiración',
      }
    },
    auth: {
      login_title: 'OASIS ACCESS',
      register_title: 'REGISTRARSE',
      user_label: 'Usuario',
      user_placeholder: 'Mínimo 3 caracteres',
      password_label: 'Contraseña',
      password_placeholder: 'Mínimo 6 caracteres',
      email_label: 'Correo Electrónico',
      btn_login: 'ENTRAR',
      btn_register: 'REGISTRARME',
      link_register: 'Solicitar Acceso',
      link_login: 'Volver a Login',
      loading: 'Cargando...',
    },
  },
  en: {
    app: {
      title: 'OASIS Ecosystem',
      loading: 'Synchronizing Ecosystem...',
      footer_version: 'v1.3.0 © 2026',
    },
    nav: {
      home: 'Home',
      peticiones: 'Requests',
      admin: 'Admin Panel',
      login: 'Login',
      logout: 'Logout',
    },
    home: {
      hero_title: 'Welcome',
      hero_subtitle: 'More than a church, a family',
      cards: {
        peticiones: 'Requests',
        peticiones_desc: 'Community',
        diezmos: 'Tithes',
        diezmos_desc: 'Finances',
        recursos: 'Resources',
        recursos_desc: 'Logistics',
        leccion: 'Lesson',
        leccion_desc: 'Study',
        certificados: 'Certificates',
        certificados_desc: 'Management',
      },
      carousel_load: 'Loading announcements...',
      no_anuncios: 'No announcements at this time',
      events_title: 'Upcoming Events',
      no_events: 'No upcoming events scheduled',
      location_title: 'Find Us',
      btn_maps: 'View on Google Maps',
      community: {
        comunidad: 'Community',
        comunidad_desc: 'Connect with brothers and sisters in faith',
        servicio: 'Service',
        servicio_desc: 'Our purpose is to serve and love',
        crecimiento: 'Growth',
        crecimiento_desc: 'Resources for your spiritual development',
        esperanza: 'Hope',
        esperanza_desc: 'Your faith is our inspiration',
      }
    },
    auth: {
      login_title: 'OASIS ACCESS',
      register_title: 'REGISTER',
      user_label: 'Username',
      user_placeholder: 'Minimum 3 characters',
      password_label: 'Password',
      password_placeholder: 'Minimum 6 characters',
      email_label: 'Email Address',
      btn_login: 'ENTER',
      btn_register: 'REGISTER',
      link_register: 'Request Access',
      link_login: 'Back to Login',
      loading: 'Loading...',
    },
  }
};

class I18nService {
  constructor() {
    this.locale = localStorage.getItem('oasis_locale') || 'es';
    this.dictionary = DICTIONARY[this.locale];
  }

  /**
     * Inicializa el servicio
     */
  init() {
    logEvent('i18n_init', { locale: this.locale });
    this.updateDocumentLang();
  }

  /**
     * Cambia el idioma actual
     * @param {string} lang - Código de idioma (es, en)
     */
  setLocale(lang) {
    if (!DICTIONARY[lang]) {
      console.warn(`Locale ${lang} not supported`);
      return;
    }

    this.locale = lang;
    this.dictionary = DICTIONARY[lang];
    localStorage.setItem('oasis_locale', lang);
    this.updateDocumentLang();

    logEvent('i18n_locale_changed', { locale: lang });

    // Recargar la página es la forma más segura de actualizar todo el contenido en esta arquitectura
    window.location.reload();
  }

  /**
   * Actualiza el atributo lang del HTML y elementos estáticos
   */
  updateDocumentLang() {
    document.documentElement.lang = this.locale;

    // Update static elements if they exist
    const updates = {
      'footer-title': 'app.title',
      'footer-version': 'app.footer_version'
    };

    for (const [id, key] of Object.entries(updates)) {
      const el = document.getElementById(id);
      if (el) el.textContent = this.t(key);
    }
  }

  /**
     * Obtiene una traducción
     * @param {string} key - Clave de traducción (ej: 'auth.login_title')
     * @returns {string} Texto traducido
     */
  t(key) {
    const keys = key.split('.');
    let value = this.dictionary;

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation missing: ${key}`);
        return key;
      }
    }

    return value;
  }

  /**
     * Alterna entre español e inglés
     */
  toggleLanguage() {
    const newLang = this.locale === 'es' ? 'en' : 'es';
    this.setLocale(newLang);
  }
}

export const i18n = new I18nService();
