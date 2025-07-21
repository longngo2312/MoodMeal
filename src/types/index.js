export * from './database';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} created_at
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {boolean} loading
 * @property {(email: string, password: string) => Promise<void>} signIn
 * @property {(email: string, password: string) => Promise<void>} signUp
 * @property {() => Promise<void>} signOut
 */

/**
 * @typedef {Object} MealFormData
 * @property {string} name
 * @property {string} description
 * @property {string[]} ingredients
 * @property {'breakfast'|'lunch'|'dinner'|'snack'} meal_time
 * @property {string} date
 */

/**
 * @typedef {Object} SymptomFormData
 * @property {string} symptom_type
 * @property {number} severity
 * @property {string} description
 * @property {string} date
 * @property {string} time
 */

/**
 * @typedef {Object} ProfileFormData
 * @property {string} name
 * @property {number} age
 * @property {'male'|'female'|'other'} gender
 * @property {string[]} medical_history
 */

/**
 * @typedef {Object} RootStackParamList
 * @property {undefined} Auth
 * @property {undefined} Main
 * @property {undefined} Profile
 * @property {{ meal?: import('./database').Meal }} MealForm
 * @property {{ symptom?: import('./database').Symptom }} SymptomForm
 */

/**
 * @typedef {Object} BottomTabParamList
 * @property {undefined} Dashboard
 * @property {undefined} Calendar
 * @property {undefined} Settings
 */
