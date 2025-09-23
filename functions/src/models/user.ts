export interface User {
  // Dados pessoais
  name?: string;
  phone: string;
  age?: number;
  sex?: string;
  createdAt: FirebaseFirestore.Timestamp;
  lastSeen?: FirebaseFirestore.Timestamp;

  // Medidas físicas
  height?: number; // em cm
  weight?: number; // em kg
  bmi?: number; // IMC
  bodyFatPercentage?: number; // Percentual de gordura corporal, (opcional?)

  // Condição física e objetivos
  goal?: Goal;
  activityLevel?: ActivityLevel;

  // Saúde
  medicalConditions?: string[]; // ex: ['hipertensão', 'diabetes']
  injuries?: string[]; // ex: ['joelho direito', 'ombro esquerdo']
  medications?: string[]; // ex: ['insulina', 'anti-inflamatório']
}

export enum Goal {
  "Perda de peso",
  "Ganho de massa",
  "Resistência",
  "Saúde geral",
}

export enum ActivityLevel {
  "Sedentário",
  "Leve",
  "Moderado",
  "Intenso",
}

export interface UserDoc extends User {
  id: string;
}
