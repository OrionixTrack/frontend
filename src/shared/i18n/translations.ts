import type { UserRole } from '@shared/types'

export type Locale = 'uk' | 'en'

export interface TranslationDictionary {
  auth: {
    appName: string
    heroTitle: string
    heroDescription: string
    roleOwner: string
    roleDispatcher: string
    roleDriver: string
    ownerDescription: string
    dispatcherDescription: string
    driverDescription: string
    email: string
    password: string
    newPassword: string
    fullName: string
    companyName: string
    firstName: string
    lastName: string
    selectedLanguage: string
    signInOwner: string
    signInDispatcher: string
    signIn: string
    signingIn: string
    invalidCredentials: string
    signInError: string
    createOwnerAccount: string
    creatingOwnerAccount: string
    registerTitle: string
    registerDescription: string
    registerSuccess: string
    checkEmailTitle: string
    checkEmailDescription: string
    checkEmailAction: string
    verifyEmailTitle: string
    verifyEmailDescription: string
    verifyEmailAction: string
    verifyingEmail: string
    verifyEmailSuccess: string
    verifyEmailLoading: string
    verifyEmailInvalid: string
    verifyEmailError: string
    resendVerificationTitle: string
    resendVerificationDescription: string
    resendVerificationAction: string
    resendingVerification: string
    resendVerificationSuccess: string
    forgotPasswordTitle: string
    forgotPasswordDescription: string
    forgotPasswordAction: string
    sendingResetLink: string
    forgotPasswordSuccess: string
    resetPasswordTitle: string
    resetPasswordDescription: string
    resetPasswordAction: string
    resettingPassword: string
    resetPasswordSuccess: string
    acceptInvitationTitle: string
    acceptInvitationDescription: string
    acceptInvitationAction: string
    acceptingInvitation: string
    acceptInvitationSuccess: string
    acceptInvitationInvalid: string
    acceptInvitationExpired: string
    acceptInvitationUsed: string
    backToLogin: string
    registerLink: string
    resendVerificationLink: string
    forgotPasswordLink: string
    tokenRequired: string
    emailNotVerified: string
    resendVerificationForEmail: string
    resendAvailableIn: string
    resendTooSoon: string
  }
  common: {
    language: string
    menu: string
    close: string
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
    workspaceDriver: string
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
    driverTrips: string
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
  invitations: {
    pageTitle: string
    openInviteDialog: string
    inviteTitle: string
    inviteDescription: string
    invalidEmail: string
    searchPlaceholder: string
    newestFirst: string
    oldestFirst: string
    previousPage: string
    nextPage: string
    pageLabel: string
    email: string
    role: string
    roleDriver: string
    roleDispatcher: string
    sendInvite: string
    sendingInvite: string
    inviteSent: string
    loadError: string
    createError: string
    listTitle: string
    empty: string
    emptySearch: string
    status: string
    statusPending: string
    statusAccepted: string
    statusExpired: string
    createdAt: string
    expiresAt: string
    acceptedAt: string
    alreadyRegistered: string
    alreadyInvited: string
  }
  ownerSettings: {
    pageTitle: string
    profileTitle: string
    companyTitle: string
    fullName: string
    language: string
    companyName: string
    saveProfile: string
    saveCompany: string
    saving: string
    profileSaved: string
    companySaved: string
    loadError: string
    saveError: string
  }
  errors: {
    notFoundTitle: string
    notFoundDescription: string
    networkUnavailable: string
    requestFailed: string
    requestTimeout: string
  }
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    auth: {
      appName: 'OrionixTrack',
      heroTitle: 'Manage operations',
      heroDescription: '',
      roleOwner: 'Company Owner',
      roleDispatcher: 'Dispatcher',
      roleDriver: 'Driver',
      ownerDescription: 'Access for the company owner',
      dispatcherDescription: 'Access for the dispatcher',
      driverDescription: 'Access for the driver',
      email: 'Email',
      password: 'Password',
      newPassword: 'New password',
      fullName: 'Full name',
      companyName: 'Company name',
      firstName: 'First name',
      lastName: 'Last name',
      selectedLanguage: 'Selected language',
      signInOwner: 'Company Owner',
      signInDispatcher: 'Dispatcher',
      signIn: 'Sign in',
      signingIn: 'Signing in...',
      invalidCredentials: 'Incorrect email or password.',
      signInError: 'Unable to sign in.',
      createOwnerAccount: 'Create owner account',
      creatingOwnerAccount: 'Creating account...',
      registerTitle: 'Register company owner',
      registerDescription: 'Create a new owner workspace and set up the company profile.',
      registerSuccess: 'Registration completed. Check your inbox to verify the email.',
      checkEmailTitle: 'Check your email',
      checkEmailDescription: 'We sent you a confirmation email. Open the link in that email to activate your account.',
      checkEmailAction: 'Resend verification email',
      verifyEmailTitle: 'Verify email',
      verifyEmailDescription: 'Confirm the email token to activate the owner account and continue automatically.',
      verifyEmailAction: 'Verify email',
      verifyingEmail: 'Verifying email...',
      verifyEmailSuccess: 'Email verified, signing you in...',
      verifyEmailLoading: 'Verifying your email...',
      verifyEmailInvalid: 'The verification link is invalid or has expired.',
      verifyEmailError: 'Unable to verify email.',
      resendVerificationTitle: 'Resend verification email',
      resendVerificationDescription: 'Request a new email verification link for the owner account.',
      resendVerificationAction: 'Send verification email',
      resendingVerification: 'Sending email...',
      resendVerificationSuccess: 'Verification email has been sent.',
      forgotPasswordTitle: 'Forgot password',
      forgotPasswordDescription: '',
      forgotPasswordAction: 'Send reset link',
      sendingResetLink: 'Sending link...',
      forgotPasswordSuccess: 'Password reset instructions have been sent if the account exists.',
      resetPasswordTitle: 'Reset password',
      resetPasswordDescription: 'Set a new password using the reset token from the email.',
      resetPasswordAction: 'Set new password',
      resettingPassword: 'Updating password...',
      resetPasswordSuccess: 'Password updated. You can now sign in.',
      acceptInvitationTitle: 'Accept invitation',
      acceptInvitationDescription: 'Create the invited employee account and continue to the workspace.',
      acceptInvitationAction: 'Create account',
      acceptingInvitation: 'Creating account...',
      acceptInvitationSuccess: 'Invitation accepted. Sign in with the new credentials.',
      acceptInvitationInvalid: 'This invitation link is invalid.',
      acceptInvitationExpired: 'This invitation link has expired.',
      acceptInvitationUsed: 'This invitation link has already been used or is no longer valid.',
      backToLogin: 'Back to sign in',
      registerLink: 'Create owner account',
      resendVerificationLink: 'Resend verification email',
      forgotPasswordLink: 'Forgot password?',
      tokenRequired: 'A valid token is required to continue.',
      emailNotVerified: 'Your email is not verified yet. Please confirm it before signing in.',
      resendVerificationForEmail: 'Resend verification email',
      resendAvailableIn: 'You can request another email in {time}.',
      resendTooSoon: 'You recently requested a verification email. Please wait a bit before trying again.',
    },
    common: {
      language: 'Language',
      menu: 'Menu',
      close: 'Close',
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
      workspaceDriver: 'Driver workspace',
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
      driverTrips: 'My trips',
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
    invitations: {
      pageTitle: 'Invitations',
      openInviteDialog: 'New invitation',
      inviteTitle: 'Invite employee',
      inviteDescription: 'Send an invitation by email and track its status below.',
      invalidEmail: 'Enter a valid email address.',
      searchPlaceholder: 'Search by email',
      newestFirst: 'Newest first',
      oldestFirst: 'Oldest first',
      previousPage: 'Previous',
      nextPage: 'Next',
      pageLabel: 'Page {page}',
      email: 'Email',
      role: 'Role',
      roleDriver: 'Driver',
      roleDispatcher: 'Dispatcher',
      sendInvite: 'Send invitation',
      sendingInvite: 'Sending invitation...',
      inviteSent: 'Invitation sent.',
      loadError: 'Invitations could not be loaded.',
      createError: 'Invitation could not be created.',
      listTitle: 'Invitation history',
      empty: 'No invitations have been sent yet.',
      emptySearch: 'No invitations match your search.',
      status: 'Status',
      statusPending: 'Pending',
      statusAccepted: 'Accepted',
      statusExpired: 'Expired',
      createdAt: 'Created',
      expiresAt: 'Expires',
      acceptedAt: 'Accepted',
      alreadyRegistered: 'A user with this email already exists.',
      alreadyInvited: 'An invitation has already been sent to this email.',
    },
    ownerSettings: {
      pageTitle: 'Company settings',
      profileTitle: 'Owner profile',
      companyTitle: 'Company details',
      fullName: 'Full name',
      language: 'Language',
      companyName: 'Company name',
      saveProfile: 'Save profile',
      saveCompany: 'Save company',
      saving: 'Saving...',
      profileSaved: 'Profile updated.',
      companySaved: 'Company details updated.',
      loadError: 'Owner profile could not be loaded.',
      saveError: 'Changes could not be saved.',
    },
    errors: {
      notFoundTitle: '404',
      notFoundDescription: 'The requested page does not exist.',
      networkUnavailable: 'Unable to connect to the server right now. Please try again in a moment.',
      requestFailed: 'Something went wrong while processing the request.',
      requestTimeout: 'The server is taking too long to respond. Please try again.',
    },
  },
  uk: {
    auth: {
      appName: 'OrionixTrack',
      heroTitle: 'Керуйте операціями',
      heroDescription: '',
      roleOwner: 'Власник компанії',
      roleDispatcher: 'Диспетчер',
      roleDriver: 'Водій',
      ownerDescription: 'Доступ для власника компанії',
      dispatcherDescription: 'Доступ для диспетчера',
      driverDescription: 'Доступ для водія',
      email: 'Email',
      password: 'Пароль',
      newPassword: 'Новий пароль',
      fullName: "Повне ім'я",
      companyName: 'Назва компанії',
      firstName: "Ім'я",
      lastName: 'Прізвище',
      selectedLanguage: 'Обрана мова',
      signInOwner: 'Власник компанії',
      signInDispatcher: 'Диспетчер',
      signIn: 'Увійти',
      signingIn: 'Вхід...',
      invalidCredentials: 'Неправильний email або пароль.',
      signInError: 'Не вдалося виконати вхід.',
      createOwnerAccount: 'Створити акаунт власника',
      creatingOwnerAccount: 'Створення акаунта...',
      registerTitle: 'Реєстрація власника компанії',
      registerDescription: 'Створіть новий owner-акаунт і одразу налаштуйте профіль компанії.',
      registerSuccess: 'Реєстрацію завершено. Перевірте пошту, щоб підтвердити email.',
      checkEmailTitle: 'Перевірте пошту',
      checkEmailDescription: 'Ми надіслали вам лист для підтвердження. Відкрийте посилання в листі, щоб активувати акаунт.',
      checkEmailAction: 'Надіслати лист підтвердження ще раз',
      verifyEmailTitle: 'Підтвердження email',
      verifyEmailDescription: 'Підтвердьте токен з листа, щоб активувати акаунт owner і продовжити автоматично.',
      verifyEmailAction: 'Підтвердити email',
      verifyingEmail: 'Підтвердження email...',
      verifyEmailSuccess: 'Email підтверджено, входимо в акаунт...',
      verifyEmailLoading: 'Підтверджуємо email...',
      verifyEmailInvalid: 'Посилання недійсне або прострочене.',
      verifyEmailError: 'Не вдалося підтвердити email.',
      resendVerificationTitle: 'Повторна відправка листа',
      resendVerificationDescription: 'Запросіть новий лист для підтвердження owner-акаунта.',
      resendVerificationAction: 'Надіслати лист підтвердження',
      resendingVerification: 'Надсилання листа...',
      resendVerificationSuccess: 'Лист для підтвердження надіслано.',
      forgotPasswordTitle: 'Забули пароль',
      forgotPasswordDescription: '',
      forgotPasswordAction: 'Надіслати посилання',
      sendingResetLink: 'Надсилання посилання...',
      forgotPasswordSuccess: 'Інструкцію зі скидання пароля надіслано, якщо акаунт існує.',
      resetPasswordTitle: 'Скидання пароля',
      resetPasswordDescription: 'Встановіть новий пароль за токеном із листа.',
      resetPasswordAction: 'Встановити новий пароль',
      resettingPassword: 'Оновлення пароля...',
      resetPasswordSuccess: 'Пароль оновлено. Тепер можна увійти.',
      acceptInvitationTitle: 'Прийняття запрошення',
      acceptInvitationDescription: 'Створіть акаунт запрошеного працівника і продовжіть роботу в системі.',
      acceptInvitationAction: 'Створити акаунт',
      acceptingInvitation: 'Створення акаунта...',
      acceptInvitationSuccess: 'Інвайт прийнято. Увійдіть з новими даними.',
      acceptInvitationInvalid: 'Це посилання запрошення недійсне.',
      acceptInvitationExpired: 'Термін дії цього запрошення минув.',
      acceptInvitationUsed: 'Цей інвайт уже використано або він більше недійсний.',
      backToLogin: 'Повернутися до входу',
      registerLink: 'Створити акаунт власника',
      resendVerificationLink: 'Повторно надіслати лист',
      forgotPasswordLink: 'Забули пароль?',
      tokenRequired: 'Потрібен валідний токен, щоб продовжити.',
      emailNotVerified: 'Пошта ще не підтверджена. Будь ласка, підтвердьте її перед входом.',
      resendVerificationForEmail: 'Надіслати лист підтвердження ще раз',
      resendAvailableIn: 'Новий лист можна запросити через {time}.',
      resendTooSoon: 'Ви вже нещодавно запитували лист підтвердження. Зачекайте трохи й спробуйте ще раз.',
    },
    common: {
      language: 'Мова',
      menu: 'Меню',
      close: 'Закрити',
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
      workspaceDriver: 'Робочий простір водія',
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
      driverTrips: 'Мої рейси',
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
    invitations: {
      pageTitle: 'Інвайти',
      openInviteDialog: 'Новий інвайт',
      inviteTitle: 'Запросити працівника',
      inviteDescription: 'Надішліть інвайт на email і відстежуйте його статус нижче.',
      invalidEmail: 'Введіть коректний email.',
      searchPlaceholder: 'Пошук за email',
      newestFirst: 'Спочатку нові',
      oldestFirst: 'Спочатку старі',
      previousPage: 'Назад',
      nextPage: 'Далі',
      pageLabel: 'Сторінка {page}',
      email: 'Email',
      role: 'Роль',
      roleDriver: 'Водій',
      roleDispatcher: 'Диспетчер',
      sendInvite: 'Надіслати інвайт',
      sendingInvite: 'Надсилання інвайту...',
      inviteSent: 'Інвайт надіслано.',
      loadError: 'Не вдалося завантажити інвайти.',
      createError: 'Не вдалося створити інвайт.',
      listTitle: 'Історія інвайтів',
      empty: 'Інвайтів ще не було надіслано.',
      emptySearch: 'За вашим запитом інвайтів не знайдено.',
      status: 'Статус',
      statusPending: 'Очікує',
      statusAccepted: 'Прийнято',
      statusExpired: 'Прострочено',
      createdAt: 'Створено',
      expiresAt: 'Діє до',
      acceptedAt: 'Прийнято',
      alreadyRegistered: 'Користувач з таким email уже існує.',
      alreadyInvited: 'На цей email уже відправлено інвайт.',
    },
    ownerSettings: {
      pageTitle: 'Налаштування компанії',
      profileTitle: 'Профіль власника',
      companyTitle: 'Дані компанії',
      fullName: "Повне ім'я",
      language: 'Інтерфейсу',
      companyName: 'Назва компанії',
      saveProfile: 'Зберегти профіль',
      saveCompany: 'Зберегти компанію',
      saving: 'Збереження...',
      profileSaved: 'Профіль оновлено.',
      companySaved: 'Дані компанії оновлено.',
      loadError: 'Не вдалося завантажити профіль власника.',
      saveError: 'Не вдалося зберегти зміни.',
    },
    errors: {
      notFoundTitle: '404',
      notFoundDescription: 'Запитувана сторінка не існує.',
      networkUnavailable: "Не вдалося з'єднатися із сервером. Спробуйте ще раз трохи пізніше.",
      requestFailed: 'Не вдалося обробити запит. Спробуйте ще раз.',
      requestTimeout: 'Сервер відповідає надто довго. Спробуйте ще раз.',
    },
  },
}

export const getRoleLabel = (locale: Locale, role: UserRole): string =>
  role === 'owner'
    ? translations[locale].auth.roleOwner
    : role === 'dispatcher'
      ? translations[locale].auth.roleDispatcher
      : translations[locale].auth.roleDriver
