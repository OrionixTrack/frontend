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
    cancel: string
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
  employees: {
    pageTitle: string
    listTitle: string
    description: string
    typeLabel: string
    driversTab: string
    dispatchersTab: string
    searchLabel: string
    searchPlaceholder: string
    sortByLabel: string
    sortOrderLabel: string
    newestFirst: string
    oldestFirst: string
    previousPage: string
    nextPage: string
    pageLabel: string
    sortName: string
    sortSurname: string
    sortEmail: string
    sortRegisterDate: string
    columnName: string
    columnSurname: string
    columnEmail: string
    columnLanguage: string
    columnRegisterDate: string
    columnActions: string
    editAction: string
    removeAction: string
    editTitle: string
    editDescription: string
    saveChanges: string
    saving: string
    validationError: string
    removeTitle: string
    removeDriverDescription: string
    removeDispatcherDescription: string
    confirmRemove: string
    removing: string
    inviteCta: string
    empty: string
    emptySearch: string
    loadError: string
    updateError: string
    removeError: string
    driverRemoveConflict: string
    updateSuccess: string
    removeSuccess: string
  }
  vehicles: {
    pageTitle: string
    listTitle: string
    description: string
    createAction: string
    createTitle: string
    createDescription: string
    editTitle: string
    editDescription: string
    saveChanges: string
    saving: string
    searchLabel: string
    searchPlaceholder: string
    sortByLabel: string
    sortOrderLabel: string
    ascending: string
    descending: string
    sortName: string
    sortLicensePlate: string
    sortBrand: string
    sortProductionYear: string
    fieldName: string
    fieldLicensePlate: string
    fieldBrand: string
    fieldModel: string
    fieldProductionYear: string
    fieldCapacity: string
    fieldIsActive: string
    validationError: string
    duplicateLicensePlate: string
    saveError: string
    loadError: string
    createSuccess: string
    updateSuccess: string
    activatedSuccess: string
    deactivatedSuccess: string
    empty: string
    emptySearch: string
    columnVehicle: string
    columnSpecs: string
    columnCapacity: string
    columnTracker: string
    columnStatus: string
    columnActions: string
    statusActive: string
    statusInactive: string
    noTracker: string
    editAction: string
    activateAction: string
    deactivateAction: string
    trackerAction: string
    deleteAction: string
    deleteTitle: string
    deleteDescription: string
    confirmDelete: string
    deleting: string
    deleteError: string
    deleteConflict: string
    deleteSuccess: string
    trackerTitle: string
    trackerManageTitle: string
    trackerManageDescription: string
    trackerField: string
    trackerNone: string
    trackerCurrent: string
    saveTracker: string
    trackerSaved: string
    trackerSaveError: string
    regenerateTrackerToken: string
    trackerTokenLabel: string
    trackerTokenError: string
    trackerTokenUnavailable: string
    summaryVehicles: string
    summaryVehiclesHint: string
    summaryTrackers: string
    summaryTrackersHint: string
  }
  trackers: {
    pageTitle: string
    listTitle: string
    description: string
    createAction: string
    createTitle: string
    createDescription: string
    editTitle: string
    editDescription: string
    saveChanges: string
    saving: string
    searchLabel: string
    searchPlaceholder: string
    sortByLabel: string
    sortOrderLabel: string
    ascending: string
    descending: string
    sortName: string
    sortTrackerId: string
    fieldName: string
    fieldVehicle: string
    searchVehiclePlaceholder: string
    validationError: string
    loadError: string
    saveError: string
    vehicleConflict: string
    createSuccess: string
    updateSuccess: string
    empty: string
    emptySearch: string
    unassigned: string
    columnId: string
    columnName: string
    columnVehicle: string
    columnActions: string
    editAction: string
    regenerateAction: string
    deleteAction: string
    tokenLabel: string
    copyToken: string
    copySuccess: string
    copyError: string
    tokenError: string
    tokenSuccess: string
    tokenDialogTitle: string
    tokenDialogDescription: string
    regenerateConfirmTitle: string
    regenerateConfirmDescription: string
    confirmRegenerate: string
    deleteTitle: string
    deleteDescription: string
    confirmDelete: string
    deleting: string
    deleteError: string
    deleteConflict: string
    deleteSuccess: string
  }
  channels: {
    pageTitle: string
    listTitle: string
    description: string
    createAction: string
    createTitle: string
    createDescription: string
    editTitle: string
    editDescription: string
    saveChanges: string
    saving: string
    searchLabel: string
    searchPlaceholder: string
    sortByLabel: string
    sortOrderLabel: string
    ascending: string
    descending: string
    sortName: string
    sortChannelId: string
    fieldName: string
    fieldTrip: string
    searchTripPlaceholder: string
    validationError: string
    loadError: string
    saveError: string
    tripConflict: string
    createSuccess: string
    updateSuccess: string
    empty: string
    emptySearch: string
    unassigned: string
    copyLink: string
    copyLinkSuccess: string
    copyError: string
    publicLinkLabel: string
    columnName: string
    columnTrip: string
    columnLink: string
    columnActions: string
    editAction: string
    deleteAction: string
    deleteTitle: string
    deleteDescription: string
    confirmDelete: string
    deleting: string
    deleteError: string
    deleteSuccess: string
    statusPlanned: string
    statusInProgress: string
    statusCompleted: string
    statusCancelled: string
  }
  trips: {
    pageTitle: string
    listTitle: string
    description: string
    searchLabel: string
    searchPlaceholder: string
    dateFromLabel: string
    dateToLabel: string
    sortByLabel: string
    sortOrderLabel: string
    statusLabel: string
    allStatuses: string
    statusPlanned: string
    statusInProgress: string
    statusCompleted: string
    statusCancelled: string
    sortPlannedStart: string
    sortTripId: string
    sortStatus: string
    ascending: string
    descending: string
    empty: string
    emptySearch: string
    loadError: string
    detailTitle: string
    detailLoadError: string
    statsLoadError: string
    noTripSelected: string
    closeDetails: string
    selectTripPrompt: string
    overviewTabLabel: string
    statsTabLabel: string
    plannedStartLabel: string
    actualStartLabel: string
    endLabel: string
    contactLabel: string
    driverLabel: string
    vehicleLabel: string
    dispatcherLabel: string
    descriptionLabel: string
    noDescription: string
    noPersonAssigned: string
    noVehicleAssigned: string
    routeTitle: string
    routeDescription: string
    routeTrackAvailable: string
    routeTrackUnavailable: string
    startPointLabel: string
    currentPointLabel: string
    finishPointLabel: string
    telemetryTitle: string
    telemetryDescription: string
    latestTelemetryTitle: string
    latestTelemetryDescription: string
    speedLabel: string
    temperatureLabel: string
    humidityLabel: string
    telemetryTimeLabel: string
    noTelemetry: string
    totalPointsLabel: string
    minLabel: string
    maxLabel: string
    avgLabel: string
    noStats: string
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
      cancel: 'Cancel',
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
    employees: {
      pageTitle: 'Employees',
      listTitle: 'Team management',
      description: 'Drivers and dispatchers are managed separately. New employees appear through invitations.',
      typeLabel: 'Employee type',
      driversTab: 'Drivers',
      dispatchersTab: 'Dispatchers',
      searchLabel: 'Search',
      searchPlaceholder: 'Search by name, surname, or email',
      sortByLabel: 'Sort by',
      sortOrderLabel: 'Order',
      newestFirst: 'Newest first',
      oldestFirst: 'Oldest first',
      previousPage: 'Previous page',
      nextPage: 'Next page',
      pageLabel: 'Page {page}',
      sortName: 'Name',
      sortSurname: 'Surname',
      sortEmail: 'Email',
      sortRegisterDate: 'Register date',
      columnName: 'Name',
      columnSurname: 'Surname',
      columnEmail: 'Email',
      columnLanguage: 'Language',
      columnRegisterDate: 'Register date',
      columnActions: 'Actions',
      editAction: 'Edit',
      removeAction: 'Remove',
      editTitle: 'Edit employee',
      editDescription: 'Update the name and surname for this {type}.',
      saveChanges: 'Save changes',
      saving: 'Saving...',
      validationError: 'Name and surname are required.',
      removeTitle: 'Remove employee',
      removeDriverDescription:
        'Remove this driver from the company? This can be blocked when the driver still has planned or active trips.',
      removeDispatcherDescription: 'Remove this dispatcher from the company? This action cannot be undone.',
      confirmRemove: 'Remove employee',
      removing: 'Removing...',
      inviteCta: 'Go to invitations',
      empty: 'No employees found yet. Add team members through invitations.',
      emptySearch: 'No employees match your search.',
      loadError: 'Employees could not be loaded.',
      updateError: 'Employee changes could not be saved.',
      removeError: 'Employee could not be removed.',
      driverRemoveConflict: 'Cannot remove this driver while there are planned or active trips assigned.',
      updateSuccess: 'Employee updated successfully.',
      removeSuccess: 'Employee removed successfully.',
    },
    vehicles: {
      pageTitle: 'Vehicles',
      listTitle: 'Fleet directory',
      description:
        'Manage company vehicles, toggle their availability, and connect a tracker to each unit when it is ready for trips.',
      createAction: 'Add vehicle',
      createTitle: 'Create vehicle',
      createDescription: 'Save a new transport unit in the fleet directory.',
      editTitle: 'Edit vehicle',
      editDescription: 'Update the transport record and availability settings.',
      saveChanges: 'Save changes',
      saving: 'Saving...',
      searchLabel: 'Search',
      searchPlaceholder: 'Search by name, plate, or brand',
      sortByLabel: 'Sort by',
      sortOrderLabel: 'Order',
      ascending: 'Ascending',
      descending: 'Descending',
      sortName: 'Name',
      sortLicensePlate: 'License plate',
      sortBrand: 'Brand',
      sortProductionYear: 'Production year',
      fieldName: 'Name',
      fieldLicensePlate: 'License plate',
      fieldBrand: 'Brand',
      fieldModel: 'Model',
      fieldProductionYear: 'Production year',
      fieldCapacity: 'Capacity',
      fieldIsActive: 'Vehicle is active and can be assigned to trips',
      validationError: 'Name and license plate are required.',
      duplicateLicensePlate: 'A vehicle with this license plate already exists.',
      saveError: 'Vehicle changes could not be saved.',
      loadError: 'Vehicles could not be loaded.',
      createSuccess: 'Vehicle created successfully.',
      updateSuccess: 'Vehicle updated successfully.',
      activatedSuccess: 'Vehicle activated successfully.',
      deactivatedSuccess: 'Vehicle deactivated successfully.',
      empty: 'No vehicles added yet.',
      emptySearch: 'No vehicles match your search.',
      columnVehicle: 'Vehicle',
      columnSpecs: 'Specs',
      columnCapacity: 'Capacity',
      columnTracker: 'Tracker',
      columnStatus: 'Status',
      columnActions: 'Actions',
      statusActive: 'Active',
      statusInactive: 'Inactive',
      noTracker: 'No tracker',
      editAction: 'Edit',
      activateAction: 'Activate',
      deactivateAction: 'Deactivate',
      trackerAction: 'Tracker',
      deleteAction: 'Delete',
      deleteTitle: 'Delete vehicle',
      deleteDescription: 'Delete this vehicle from the directory? This is blocked when there are planned or active trips.',
      confirmDelete: 'Delete vehicle',
      deleting: 'Deleting...',
      deleteError: 'Vehicle could not be deleted.',
      deleteConflict: 'Cannot delete this vehicle while it still has planned or active trips.',
      deleteSuccess: 'Vehicle deleted successfully.',
      trackerTitle: 'Tracker',
      trackerManageTitle: 'Manage tracker binding',
      trackerManageDescription:
        'Attach one tracker to the vehicle or remove the current binding. A tracker can belong to only one vehicle.',
      trackerField: 'Assigned tracker',
      trackerNone: 'No tracker',
      trackerCurrent: 'Current tracker',
      saveTracker: 'Save tracker',
      trackerSaved: 'Tracker binding updated successfully.',
      trackerSaveError: 'Tracker binding could not be updated.',
      regenerateTrackerToken: 'Regenerate token',
      trackerTokenLabel: 'New tracker token',
      trackerTokenError: 'Tracker token could not be regenerated.',
      trackerTokenUnavailable: 'The server did not return a tracker token in the response.',
      summaryVehicles: 'Visible vehicles',
      summaryVehiclesHint: 'The current page reflects your active search, sort, and pagination filters.',
      summaryTrackers: 'Available trackers',
      summaryTrackersHint: 'Only one tracker can be linked to one vehicle at a time.',
    },
    trackers: {
      pageTitle: 'Trackers',
      listTitle: 'Tracker registry',
      description: 'Create tracker records, bind them to vehicles, regenerate tokens, and keep device access under control.',
      createAction: 'Add tracker',
      createTitle: 'Create tracker',
      createDescription: 'Save a new tracker and show its secret token immediately after creation.',
      editTitle: 'Edit tracker',
      editDescription: 'Rename the tracker or change the assigned vehicle.',
      saveChanges: 'Save changes',
      saving: 'Saving...',
      searchLabel: 'Search',
      searchPlaceholder: 'Search by tracker name',
      sortByLabel: 'Sort by',
      sortOrderLabel: 'Order',
      ascending: 'Ascending',
      descending: 'Descending',
      sortName: 'Name',
      sortTrackerId: 'Tracker ID',
      fieldName: 'Name',
      fieldVehicle: 'Assigned vehicle',
      searchVehiclePlaceholder: 'Search vehicles by name or plate',
      validationError: 'Tracker name is required.',
      loadError: 'Trackers could not be loaded.',
      saveError: 'Tracker changes could not be saved.',
      vehicleConflict: 'This vehicle already has a tracker assigned.',
      createSuccess: 'Tracker created successfully.',
      updateSuccess: 'Tracker updated successfully.',
      empty: 'No trackers added yet.',
      emptySearch: 'No trackers match your search.',
      unassigned: 'Unassigned',
      columnId: 'ID',
      columnName: 'Tracker',
      columnVehicle: 'Vehicle',
      columnActions: 'Actions',
      editAction: 'Edit',
      regenerateAction: 'Regenerate token',
      deleteAction: 'Delete',
      tokenLabel: 'Device secret token',
      copyToken: 'Copy token',
      copySuccess: 'Tracker token copied.',
      copyError: 'Tracker token could not be copied automatically.',
      tokenError: 'Tracker token could not be regenerated.',
      tokenSuccess: 'Tracker token regenerated successfully.',
      tokenDialogTitle: 'Tracker token',
      tokenDialogDescription: 'This secret token is shown only once. Copy it now and store it securely.',
      regenerateConfirmTitle: 'Regenerate tracker token',
      regenerateConfirmDescription: 'Generate a new secret token for this tracker? The previous token will stop working.',
      confirmRegenerate: 'Regenerate token',
      deleteTitle: 'Delete tracker',
      deleteDescription: 'Delete this tracker from the registry?',
      confirmDelete: 'Delete tracker',
      deleting: 'Deleting...',
      deleteError: 'Tracker could not be deleted.',
      deleteConflict: 'Tracker cannot be deleted right now.',
      deleteSuccess: 'Tracker deleted successfully.',
    },
    channels: {
      pageTitle: 'Channels',
      listTitle: 'Public tracking channels',
      description: 'Create public tracking endpoints, bind them to trips, and share public links with clients or partners.',
      createAction: 'Add channel',
      createTitle: 'Create channel',
      createDescription: 'Save a public tracking channel with or without a linked trip.',
      editTitle: 'Edit channel',
      editDescription: 'Update the channel name or move it to another trip.',
      saveChanges: 'Save changes',
      saving: 'Saving...',
      searchLabel: 'Search',
      searchPlaceholder: 'Search by channel name',
      sortByLabel: 'Sort by',
      sortOrderLabel: 'Order',
      ascending: 'Ascending',
      descending: 'Descending',
      sortName: 'Name',
      sortChannelId: 'Channel ID',
      fieldName: 'Name',
      fieldTrip: 'Assigned trip',
      searchTripPlaceholder: 'Search trips by name or ID',
      validationError: 'Channel name is required.',
      loadError: 'Channels could not be loaded.',
      saveError: 'Channel changes could not be saved.',
      tripConflict: 'The selected trip was not found or does not belong to this company.',
      createSuccess: 'Channel created successfully.',
      updateSuccess: 'Channel updated successfully.',
      empty: 'No channels created yet.',
      emptySearch: 'No channels match your search.',
      unassigned: 'No trip',
      copyLink: 'Copy link',
      copyLinkSuccess: 'Public link copied.',
      copyError: 'Could not copy this value automatically.',
      publicLinkLabel: 'Public link',
      columnName: 'Channel',
      columnTrip: 'Trip',
      columnLink: 'Public link',
      columnActions: 'Actions',
      editAction: 'Edit',
      deleteAction: 'Delete',
      deleteTitle: 'Delete channel',
      deleteDescription: 'Delete this public tracking channel?',
      confirmDelete: 'Delete channel',
      deleting: 'Deleting...',
      deleteError: 'Channel could not be deleted.',
      deleteSuccess: 'Channel deleted successfully.',
      statusPlanned: 'Planned',
      statusInProgress: 'In progress',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',
    },
    trips: {
      pageTitle: 'Trips',
      listTitle: 'Operations overview',
      description: 'Review scheduled, active, completed, and cancelled trips with live route context and trip analytics.',
      searchLabel: 'Search',
      searchPlaceholder: 'Search by trip name or address',
      dateFromLabel: 'Date from',
      dateToLabel: 'Date to',
      sortByLabel: 'Sort by',
      sortOrderLabel: 'Order',
      statusLabel: 'Status',
      allStatuses: 'All',
      statusPlanned: 'Planned',
      statusInProgress: 'In progress',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',
      sortPlannedStart: 'Planned start',
      sortTripId: 'Trip ID',
      sortStatus: 'Status',
      ascending: 'Ascending',
      descending: 'Descending',
      empty: 'No trips found yet.',
      emptySearch: 'No trips match the current filters.',
      loadError: 'Trips could not be loaded.',
      detailTitle: 'Trip details',
      detailLoadError: 'Trip details could not be loaded.',
      statsLoadError: 'Trip analytics could not be loaded.',
      noTripSelected: 'Select a trip',
      closeDetails: 'Go back',
      selectTripPrompt: 'Choose a trip from the list to review route details and analytics.',
      overviewTabLabel: 'Overview',
      statsTabLabel: 'Stats',
      plannedStartLabel: 'Planned start',
      actualStartLabel: 'Actual start',
      endLabel: 'Completed at',
      contactLabel: 'Contact',
      driverLabel: 'Driver',
      vehicleLabel: 'Vehicle',
      dispatcherLabel: 'Dispatcher',
      descriptionLabel: 'Description',
      noDescription: 'No description provided.',
      noPersonAssigned: 'Not assigned',
      noVehicleAssigned: 'No vehicle assigned',
      routeTitle: 'Route map',
      routeDescription: 'Start, finish, and current trip position on the route.',
      routeTrackAvailable: 'Track available',
      routeTrackUnavailable: 'No live track yet',
      startPointLabel: 'Start',
      currentPointLabel: 'Current position',
      finishPointLabel: 'Finish',
      telemetryTitle: 'Current telemetry',
      telemetryDescription: 'Latest telemetry snapshot received for this trip.',
      latestTelemetryTitle: 'Latest telemetry',
      latestTelemetryDescription: 'Last telemetry snapshot captured for this trip.',
      speedLabel: 'Speed',
      temperatureLabel: 'Temperature',
      humidityLabel: 'Humidity',
      telemetryTimeLabel: 'Reported at',
      noTelemetry: 'Telemetry has not been received yet.',
      totalPointsLabel: 'Telemetry points',
      minLabel: 'Min',
      maxLabel: 'Max',
      avgLabel: 'Avg',
      noStats: 'No trip statistics available yet.',
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
      cancel: 'Скасувати',
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
    employees: {
      pageTitle: 'Працівники',
      listTitle: 'Керування командою',
      description: 'Водії та диспетчери керуються окремо. Нові працівники з’являються через invitations.',
      typeLabel: 'Тип працівника',
      driversTab: 'Водії',
      dispatchersTab: 'Диспетчери',
      searchLabel: 'Пошук',
      searchPlaceholder: 'Пошук за ім’ям, прізвищем або email',
      sortByLabel: 'Сортувати за',
      sortOrderLabel: 'Порядок',
      newestFirst: 'Спочатку нові',
      oldestFirst: 'Спочатку старі',
      previousPage: 'Попередня сторінка',
      nextPage: 'Наступна сторінка',
      pageLabel: 'Сторінка {page}',
      sortName: 'Ім’я',
      sortSurname: 'Прізвище',
      sortEmail: 'Email',
      sortRegisterDate: 'Дата реєстрації',
      columnName: 'Ім’я',
      columnSurname: 'Прізвище',
      columnEmail: 'Email',
      columnLanguage: 'Мова',
      columnRegisterDate: 'Дата реєстрації',
      columnActions: 'Дії',
      editAction: 'Редагувати',
      removeAction: 'Видалити',
      editTitle: 'Редагування працівника',
      editDescription: 'Оновіть ім’я та прізвище для цього {type}.',
      saveChanges: 'Зберегти зміни',
      saving: 'Збереження...',
      validationError: 'Ім’я та прізвище є обов’язковими.',
      removeTitle: 'Видалення працівника',
      removeDriverDescription:
        'Видалити цього водія з компанії? Дію може бути заблоковано, якщо за ним ще є заплановані або активні рейси.',
      removeDispatcherDescription: 'Видалити цього диспетчера з компанії? Цю дію не можна скасувати.',
      confirmRemove: 'Видалити працівника',
      removing: 'Видалення...',
      inviteCta: 'Перейти до запрошень',
      empty: 'Список працівників порожній. Додайте команду через invitations.',
      emptySearch: 'За вашим запитом працівників не знайдено.',
      loadError: 'Не вдалося завантажити працівників.',
      updateError: 'Не вдалося зберегти зміни працівника.',
      removeError: 'Не вдалося видалити працівника.',
      driverRemoveConflict: 'Неможливо видалити водія, поки за ним є заплановані або активні рейси.',
      updateSuccess: 'Працівника успішно оновлено.',
      removeSuccess: 'Працівника успішно видалено.',
    },
    vehicles: {
      pageTitle: 'Транспорт',
      listTitle: 'Довідник рухомого складу',
      description:
        'Керуйте транспортом компанії, вмикайте або вимикайте доступність і прив’язуйте GPS-трекер до кожного ТЗ, коли він готовий до рейсів.',
      createAction: 'Додати транспорт',
      createTitle: 'Створення ТЗ',
      createDescription: 'Збережіть новий транспортний засіб у довіднику компанії.',
      editTitle: 'Редагування ТЗ',
      editDescription: 'Оновіть дані транспортного засобу та його доступність.',
      saveChanges: 'Зберегти зміни',
      saving: 'Збереження...',
      searchLabel: 'Пошук',
      searchPlaceholder: 'Пошук за назвою, номером або брендом',
      sortByLabel: 'Сортувати за',
      sortOrderLabel: 'Порядок',
      ascending: 'За зростанням',
      descending: 'За спаданням',
      sortName: 'Назвою',
      sortLicensePlate: 'Номером',
      sortBrand: 'Брендом',
      sortProductionYear: 'Роком випуску',
      fieldName: 'Назва',
      fieldLicensePlate: 'Номер',
      fieldBrand: 'Бренд',
      fieldModel: 'Модель',
      fieldProductionYear: 'Рік випуску',
      fieldCapacity: 'Місткість',
      fieldIsActive: 'Транспорт активний і може бути призначений на рейси',
      validationError: 'Назва та номер є обов’язковими.',
      duplicateLicensePlate: 'Транспорт із таким номером уже існує.',
      saveError: 'Не вдалося зберегти зміни транспорту.',
      loadError: 'Не вдалося завантажити транспорт.',
      createSuccess: 'Транспорт успішно створено.',
      updateSuccess: 'Транспорт успішно оновлено.',
      activatedSuccess: 'Транспорт успішно активовано.',
      deactivatedSuccess: 'Транспорт успішно деактивовано.',
      empty: 'Транспортних засобів ще немає.',
      emptySearch: 'За вашим запитом транспорт не знайдено.',
      columnVehicle: 'Транспорт',
      columnSpecs: 'Характеристики',
      columnCapacity: 'Місткість',
      columnTracker: 'Трекер',
      columnStatus: 'Статус',
      columnActions: 'Дії',
      statusActive: 'Активний',
      statusInactive: 'Неактивний',
      noTracker: 'Без трекера',
      editAction: 'Редагувати',
      activateAction: 'Активувати',
      deactivateAction: 'Деактивувати',
      trackerAction: 'Трекер',
      deleteAction: 'Видалити',
      deleteTitle: 'Видалення транспорту',
      deleteDescription:
        'Видалити цей транспорт із довідника? Дію буде заблоковано, якщо за ним є planned або in_progress рейси.',
      confirmDelete: 'Видалити транспорт',
      deleting: 'Видалення...',
      deleteError: 'Не вдалося видалити транспорт.',
      deleteConflict: 'Неможливо видалити транспорт, поки за ним є planned або in_progress рейси.',
      deleteSuccess: 'Транспорт успішно видалено.',
      trackerTitle: 'Трекер',
      trackerManageTitle: 'Керування прив’язкою трекера',
      trackerManageDescription:
        'Прив’яжіть один трекер до транспортного засобу або зніміть поточну прив’язку. Один трекер може належати лише одному ТЗ.',
      trackerField: 'Призначений трекер',
      trackerNone: 'Без трекера',
      trackerCurrent: 'Поточний трекер',
      saveTracker: 'Зберегти трекер',
      trackerSaved: 'Прив’язку трекера успішно оновлено.',
      trackerSaveError: 'Не вдалося оновити прив’язку трекера.',
      regenerateTrackerToken: 'Регенерувати токен',
      trackerTokenLabel: 'Новий токен трекера',
      trackerTokenError: 'Не вдалося регенерувати токен трекера.',
      trackerTokenUnavailable: 'Сервер не повернув токен трекера у відповіді.',
      summaryVehicles: 'Транспорт на сторінці',
      summaryVehiclesHint: 'Кількість залежить від поточного пошуку, сортування та пагінації.',
      summaryTrackers: 'Доступні трекери',
      summaryTrackersHint: 'Один трекер може бути прив’язаний лише до одного транспорту.',
    },
    trackers: {
      pageTitle: 'Трекери',
      listTitle: 'Реєстр трекерів',
      description: 'Створюйте трекери, прив’язуйте їх до транспорту, регенеруйте токени й керуйте доступом пристроїв.',
      createAction: 'Додати трекер',
      createTitle: 'Створення трекера',
      createDescription: 'Збережіть новий трекер і одразу покажіть секретний токен користувачу.',
      editTitle: 'Редагування трекера',
      editDescription: 'Оновіть назву трекера або змініть прив’язаний транспорт.',
      saveChanges: 'Зберегти зміни',
      saving: 'Збереження...',
      searchLabel: 'Пошук',
      searchPlaceholder: 'Пошук за назвою трекера',
      sortByLabel: 'Сортувати за',
      sortOrderLabel: 'Порядок',
      ascending: 'За зростанням',
      descending: 'За спаданням',
      sortName: 'Назвою',
      sortTrackerId: 'ID трекера',
      fieldName: 'Назва',
      fieldVehicle: 'Призначений транспорт',
      searchVehiclePlaceholder: 'Пошук транспорту за назвою або номером',
      validationError: 'Назва трекера є обов’язковою.',
      loadError: 'Не вдалося завантажити трекери.',
      saveError: 'Не вдалося зберегти зміни трекера.',
      vehicleConflict: 'До цього транспорту вже прив’язано інший трекер.',
      createSuccess: 'Трекер успішно створено.',
      updateSuccess: 'Трекер успішно оновлено.',
      empty: 'Трекерів ще немає.',
      emptySearch: 'За вашим запитом трекери не знайдено.',
      unassigned: 'Не прив’язано',
      columnId: 'ID',
      columnName: 'Трекер',
      columnVehicle: 'Транспорт',
      columnActions: 'Дії',
      editAction: 'Редагувати',
      regenerateAction: 'Регенерувати токен',
      deleteAction: 'Видалити',
      tokenLabel: 'Секретний токен пристрою',
      copyToken: 'Скопіювати токен',
      copySuccess: 'Токен трекера скопійовано.',
      copyError: 'Не вдалося автоматично скопіювати токен.',
      tokenError: 'Не вдалося регенерувати токен трекера.',
      tokenSuccess: 'Токен трекера успішно регенеровано.',
      tokenDialogTitle: 'Токен трекера',
      tokenDialogDescription: 'Цей секретний токен показується лише один раз. Скопіюйте його зараз і збережіть у безпечному місці.',
      regenerateConfirmTitle: 'Регенерація токена трекера',
      regenerateConfirmDescription: 'Згенерувати новий секретний токен для цього трекера? Попередній токен перестане працювати.',
      confirmRegenerate: 'Регенерувати токен',
      deleteTitle: 'Видалення трекера',
      deleteDescription: 'Видалити цей трекер із реєстру?',
      confirmDelete: 'Видалити трекер',
      deleting: 'Видалення...',
      deleteError: 'Не вдалося видалити трекер.',
      deleteConflict: 'Наразі трекер не можна видалити.',
      deleteSuccess: 'Трекер успішно видалено.',
    },
    channels: {
      pageTitle: 'Канали',
      listTitle: 'Публічні канали відстеження',
      description: 'Створюйте публічні точки трекінгу, прив’язуйте їх до рейсів і діліться посиланнями з клієнтами або партнерами.',
      createAction: 'Додати канал',
      createTitle: 'Створення каналу',
      createDescription: 'Збережіть публічний канал відстеження з рейсом або без нього.',
      editTitle: 'Редагування каналу',
      editDescription: 'Оновіть назву каналу або переприв’яжіть його до іншого рейсу.',
      saveChanges: 'Зберегти зміни',
      saving: 'Збереження...',
      searchLabel: 'Пошук',
      searchPlaceholder: 'Пошук за назвою каналу',
      sortByLabel: 'Сортувати за',
      sortOrderLabel: 'Порядок',
      ascending: 'За зростанням',
      descending: 'За спаданням',
      sortName: 'Назвою',
      sortChannelId: 'ID каналу',
      fieldName: 'Назва',
      fieldTrip: 'Призначений рейс',
      searchTripPlaceholder: 'Пошук рейсів за назвою або ID',
      validationError: 'Назва каналу є обов’язковою.',
      loadError: 'Не вдалося завантажити канали.',
      saveError: 'Не вдалося зберегти зміни каналу.',
      tripConflict: 'Обраний рейс не знайдено або він не належить цій компанії.',
      createSuccess: 'Канал успішно створено.',
      updateSuccess: 'Канал успішно оновлено.',
      empty: 'Каналів ще немає.',
      emptySearch: 'За вашим запитом канали не знайдено.',
      unassigned: 'Без рейсу',
      copyLink: 'Скопіювати посилання',
      copyLinkSuccess: 'Публічне посилання скопійовано.',
      copyError: 'Не вдалося автоматично скопіювати значення.',
      publicLinkLabel: 'Публічне посилання',
      columnName: 'Канал',
      columnTrip: 'Рейс',
      columnLink: 'Публічне посилання',
      columnActions: 'Дії',
      editAction: 'Редагувати',
      deleteAction: 'Видалити',
      deleteTitle: 'Видалення каналу',
      deleteDescription: 'Видалити цей публічний канал відстеження?',
      confirmDelete: 'Видалити канал',
      deleting: 'Видалення...',
      deleteError: 'Не вдалося видалити канал.',
      deleteSuccess: 'Канал успішно видалено.',
      statusPlanned: 'Запланований',
      statusInProgress: 'У процесі',
      statusCompleted: 'Завершений',
      statusCancelled: 'Скасований',
    },
    trips: {
      pageTitle: 'Рейси',
      listTitle: 'Огляд перевезень',
      description: 'Переглядайте заплановані, активні, завершені та скасовані рейси разом із маршрутом і аналітикою.',
      searchLabel: 'Пошук',
      searchPlaceholder: 'Пошук за назвою рейсу або адресою',
      dateFromLabel: 'Дата від',
      dateToLabel: 'Дата до',
      sortByLabel: 'Сортувати за',
      sortOrderLabel: 'Порядок',
      statusLabel: 'Статус',
      allStatuses: 'Усі',
      statusPlanned: 'Запланований',
      statusInProgress: 'У процесі',
      statusCompleted: 'Завершений',
      statusCancelled: 'Скасований',
      sortPlannedStart: 'Плановим стартом',
      sortTripId: 'ID рейсу',
      sortStatus: 'Статусом',
      ascending: 'За зростанням',
      descending: 'За спаданням',
      empty: 'Рейсів поки немає.',
      emptySearch: 'За поточними фільтрами рейси не знайдено.',
      loadError: 'Не вдалося завантажити рейси.',
      detailTitle: 'Деталі рейсу',
      detailLoadError: 'Не вдалося завантажити деталі рейсу.',
      statsLoadError: 'Не вдалося завантажити аналітику рейсу.',
      noTripSelected: 'Оберіть рейс',
      closeDetails: 'Назад',
      selectTripPrompt: 'Оберіть рейс зі списку, щоб переглянути маршрут, телеметрію й статистику.',
      overviewTabLabel: 'Огляд',
      statsTabLabel: 'Статистика',
      plannedStartLabel: 'Плановий старт',
      actualStartLabel: 'Фактичний старт',
      endLabel: 'Завершено',
      contactLabel: 'Контакт',
      driverLabel: 'Водій',
      vehicleLabel: 'Транспорт',
      dispatcherLabel: 'Диспетчер',
      descriptionLabel: 'Опис',
      noDescription: 'Опис відсутній.',
      noPersonAssigned: 'Не призначено',
      noVehicleAssigned: 'Транспорт не призначено',
      routeTitle: 'Мапа маршруту',
      routeDescription: 'Точка старту, завершення та поточна позиція рейсу.',
      routeTrackAvailable: 'Маршрут доступний',
      routeTrackUnavailable: 'Ще немає треку',
      startPointLabel: 'Старт',
      currentPointLabel: 'Поточна позиція',
      finishPointLabel: 'Фініш',
      telemetryTitle: 'Поточна телеметрія',
      telemetryDescription: 'Останній отриманий телеметричний стан для цього рейсу.',
      latestTelemetryTitle: 'Остання телеметрія',
      latestTelemetryDescription: 'Останній зафіксований телеметричний стан для цього рейсу.',
      speedLabel: 'Швидкість',
      temperatureLabel: 'Температура',
      humidityLabel: 'Вологість',
      telemetryTimeLabel: 'Час отримання',
      noTelemetry: 'Телеметрія ще не надходила.',
      totalPointsLabel: 'Точок телеметрії',
      minLabel: 'Мін',
      maxLabel: 'Макс',
      avgLabel: 'Сер',
      noStats: 'Статистика рейсу поки недоступна.',
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
