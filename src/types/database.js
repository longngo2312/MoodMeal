/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {number} age
 * @property {string} gender
 * @property {string[]} medical_history
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Meal
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} description
 * @property {string[]} ingredients
 * @property {string} meal_time
 * @property {string} date
 * @property {string} created_at
 */

/**
 * @typedef {Object} Symptom
 * @property {string} id
 * @property {string} user_id
 * @property {string} symptom_type
 * @property {number} severity
 * @property {string} description
 * @property {string} date
 * @property {string} time
 * @property {string} created_at
 */

export const Database = {
  public: {
    Tables: {
      profiles: {},
      meals: {},
      symptoms: {}
    }
  }
};
