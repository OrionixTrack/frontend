import type { UserRole } from '@shared/types'

export type Locale = 'uk' | 'en'

export interface TranslationDictionary {
  auth: {
    appName: string
    loginTitle: string
    heroTitle: string
    heroDescription: string
    roleOwner: string
    roleDispatcher: string
    ownerDescription: string
    dispatcherDescription: string
    email: string
    password: string
    signInOwner: string
    signInDispatcher: string
    signIn: string
    signingIn: string
    signInError: string
  }
  common: {
    language: string
    menu: string
    signOut: string
    loading: string
    profile: string
    company: string
    name: string
    email: string
    overview: string
    availableNow: string
    noValue: string
  }
  dashboard: {
    workspaceOwner: string
    workspaceDispatcher: string
    loadError: string
    roleViewTitle: string
    ownerPulse: string
    dispatcherPulse: string
    ownerCompany: string
    ownerEmployees: string
    ownerFleet: string
    ownerTrackers: string
    ownerChannels: string
    ownerTrips: string
    dispatcherTrips: string
    dispatcherAssignments: string
    dispatcherChannels: string
    dispatcherMap: string
    latestTrips: string
    noTrips: string
    noDestination: string
    drivers: string
    dispatchers: string
    vehicles: string
    trackers: string
    plannedTrips: string
    inProgress: string
    completed: string
    cancelled: string
  }
  errors: {
    notFoundTitle: string
    notFoundDescription: string
  }
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    auth: {
      appName: 'OrionixTrack',
      loginTitle: 'Sign in',
      heroTitle: 'Manage operations',
      heroDescription: 'Sign in to OrionixTrack',
      roleOwner: 'Company Owner',
      roleDispatcher: 'Dispatcher',
      ownerDescription: 'Access for the company owner.',
      dispatcherDescription: 'Access for the dispatcher.',
      email: 'Email',
      password: 'Password',
      signInOwner: 'Company Owner',
      signInDispatcher: 'Dispatcher',
      signIn: 'Sign in',
      signingIn: 'Signing in...',
      signInError: 'Unable to sign in.',
    },
    common: {
      language: 'Language',
      menu: 'Menu',
      signOut: 'Sign out',
      loading: 'Loading...',
      profile: 'Profile',
      company: 'Company',
      name: 'Name',
      email: 'Email',
      overview: 'Overview',
      availableNow: 'Available now',
      noValue: 'Not available',
    },
    dashboard: {
      workspaceOwner: 'Company Owner workspace',
      workspaceDispatcher: 'Dispatcher workspace',
      loadError: 'Dashboard data could not be loaded.',
      roleViewTitle: 'Trips',
      ownerPulse: 'Company pulse',
      dispatcherPulse: 'Trip pulse',
      ownerCompany: 'Company',
      ownerEmployees: 'Employees',
      ownerFleet: 'Fleet',
      ownerTrackers: 'Trackers',
      ownerChannels: 'Channels',
      ownerTrips: 'Trips',
      dispatcherTrips: 'My trips',
      dispatcherAssignments: 'Assignments',
      dispatcherChannels: 'Channels',
      dispatcherMap: 'Live map',
      latestTrips: 'Latest trips',
      noTrips: 'No trips returned yet for the current dispatcher.',
      noDestination: 'No destination',
      drivers: 'Drivers',
      dispatchers: 'Dispatchers',
      vehicles: 'Vehicles',
      trackers: 'Trackers',
      plannedTrips: 'Planned trips',
      inProgress: 'In progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    errors: {
      notFoundTitle: '404',
      notFoundDescription: 'The requested page does not exist.',
    },
  },
  uk: {
    auth: {
      appName: 'OrionixTrack',
      loginTitle: 'Вхід',
      heroTitle: 'Керуйте операціями',
      heroDescription: 'Увійдіть до OrionixTrack',
      roleOwner: 'Власник компанії',
      roleDispatcher: 'Диспетчер',
      ownerDescription: 'Доступ для власника компанії.',
      dispatcherDescription: 'Доступ для диспетчера.',
      email: 'Email',
      password: 'Пароль',
      signInOwner: 'Власник компанії',
      signInDispatcher: 'Диспетчер',
      signIn: 'Увійти',
      signingIn: 'Вхід...',
      signInError: 'Не вдалося виконати вхід.',
    },
    common: {
      language: 'Мова',
      menu: 'Меню',
      signOut: 'Вийти',
      loading: 'Завантаження...',
      profile: 'Профіль',
      company: 'Компанія',
      name: "Ім'я",
      email: 'Email',
      overview: 'Огляд',
      availableNow: 'Доступно зараз',
      noValue: 'Недоступно',
    },
    dashboard: {
      workspaceOwner: 'Робочий простір власника компанії',
      workspaceDispatcher: 'Робочий простір диспетчера',
      loadError: 'Не вдалося завантажити дані дашборду.',
      roleViewTitle: 'Рейси',
      ownerPulse: 'Стан компанії',
      dispatcherPulse: 'Стан рейсів',
      ownerCompany: 'Компанія',
      ownerEmployees: 'Працівники',
      ownerFleet: 'Транспорт',
      ownerTrackers: 'Трекери',
      ownerChannels: 'Канали',
      ownerTrips: 'Рейси',
      dispatcherTrips: 'Мої рейси',
      dispatcherAssignments: 'Призначення',
      dispatcherChannels: 'Канали',
      dispatcherMap: 'Жива карта',
      latestTrips: 'Останні рейси',
      noTrips: 'Для поточного диспетчера рейси поки не повернулися.',
      noDestination: 'Немає пункту призначення',
      drivers: 'Водії',
      dispatchers: 'Диспетчери',
      vehicles: 'Транспорт',
      trackers: 'Трекери',
      plannedTrips: 'Заплановані рейси',
      inProgress: 'У процесі',
      completed: 'Завершені',
      cancelled: 'Скасовані',
    },
    errors: {
      notFoundTitle: '404',
      notFoundDescription: 'Запитувана сторінка не існує.',
    },
  },
}

export const getRoleLabel = (locale: Locale, role: UserRole): string =>
  role === 'owner' ? translations[locale].auth.roleOwner : translations[locale].auth.roleDispatcher
