import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { mealService } from './mealService';
import { symptomService } from './symptomService';
import { profileService } from './profileService';

export const exportService = {
  async exportToPDF(userId: string): Promise<void> {
    const profile = await profileService.getProfile(userId);
    const meals = await mealService.getAllMeals(userId);
    const symptoms = await symptomService.getAllSymptoms(userId);

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3d1bf9; text-align: center; }
            h2 { color: #3d1bf9; border-bottom: 2px solid #3d1bf9; padding-bottom: 5px; }
            .profile { background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .entry { background-color: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            .date { font-weight: bold; color: #666; }
            .severity { color: #f44336; font-weight: bold; }
            .meal-time { color: #4caf50; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>MoodMeal Health Report</h1>

          <div class="profile">
            <h2>Profile Information</h2>
            <p><strong>Name:</strong> ${profile?.name || 'N/A'}</p>
            <p><strong>Age:</strong> ${profile?.age || 'N/A'}</p>
            <p><strong>Gender:</strong> ${profile?.gender || 'N/A'}</p>
            <p><strong>Medical History:</strong> ${profile?.medical_history?.join(', ') || 'None'}</p>
          </div>

          <h2>Meal History (${meals.length} entries)</h2>
          ${meals.map(meal => `
            <div class="entry">
              <div class="date">${meal.date} - <span class="meal-time">${meal.meal_time}</span></div>
              <h3>${meal.name}</h3>
              <p>${meal.description}</p>
              <p><strong>Ingredients:</strong> ${meal.ingredients.join(', ')}</p>
            </div>
          `).join('') || '<p>No meals recorded</p>'}

          <h2>Symptom History (${symptoms.length} entries)</h2>
          ${symptoms.map(symptom => `
            <div class="entry">
              <div class="date">${symptom.date} ${symptom.time}</div>
              <h3>${symptom.symptom_type} - <span class="severity">Severity: ${symptom.severity}/10</span></h3>
              <p>${symptom.description}</p>
            </div>
          `).join('') || '<p>No symptoms recorded</p>'}

          <p style="text-align: center; margin-top: 30px; color: #666;">
            Generated on ${new Date().toLocaleDateString()}
          </p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share your MoodMeal report',
      });
    }
  },
};
