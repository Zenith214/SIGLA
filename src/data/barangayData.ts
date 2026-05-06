// Barangay data structure for all 25 barangays
export interface BarangayData {
  id: string;
  name: string;
  population: number;
  households: number;
  area: number;
  surveyStatus: 'Completed' | 'In Progress' | 'Pending';
  history: {
    year: string;
    status: 'Completed' | 'In Progress' | 'Pending';
    score: string;
  }[];
}

export const barangayData: Record<string, BarangayData> = {
  "barangay-1": {
    id: "barangay-1",
    name: "Katipunan",
    population: 12450,
    households: 3120,
    area: 15.2,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "In Progress", score: "85%" },
      { year: "2023", status: "Completed", score: "78%" },
      { year: "2022", status: "Completed", score: "72%" },
      { year: "2021", status: "Completed", score: "69%" },
    ]
  },
  "barangay-2": {
    id: "barangay-2",
    name: "Tanwalang",
    population: 8750,
    households: 2180,
    area: 12.8,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "82%" },
      { year: "2023", status: "Completed", score: "75%" },
      { year: "2022", status: "Completed", score: "70%" },
      { year: "2021", status: "Completed", score: "65%" },
    ]
  },
  "barangay-3": {
    id: "barangay-3",
    name: "Solongvale",
    population: 15200,
    households: 3800,
    area: 18.5,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "88%" },
      { year: "2023", status: "Completed", score: "81%" },
      { year: "2022", status: "Completed", score: "76%" },
      { year: "2021", status: "Completed", score: "73%" },
    ]
  },
  "barangay-4": {
    id: "barangay-4",
    name: "Tala-o",
    population: 6890,
    households: 1720,
    area: 9.3,
    surveyStatus: "Pending",
    history: [
      { year: "2024", status: "Pending", score: "N/A" },
      { year: "2023", status: "Completed", score: "68%" },
      { year: "2022", status: "Completed", score: "64%" },
      { year: "2021", status: "Completed", score: "61%" },
    ]
  },
  "barangay-5": {
    id: "barangay-5",
    name: "Balasinon",
    population: 9340,
    households: 2335,
    area: 11.7,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "79%" },
      { year: "2023", status: "Completed", score: "72%" },
      { year: "2022", status: "Completed", score: "68%" },
      { year: "2021", status: "Completed", score: "63%" },
    ]
  },
  "barangay-6": {
    id: "barangay-6",
    name: "Harada Butai",
    population: 7650,
    households: 1912,
    area: 10.4,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "83%" },
      { year: "2023", status: "Completed", score: "77%" },
      { year: "2022", status: "Completed", score: "71%" },
      { year: "2021", status: "Completed", score: "67%" },
    ]
  },
  "barangay-7": {
    id: "barangay-7",
    name: "Roxas",
    population: 11200,
    households: 2800,
    area: 14.1,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "86%" },
      { year: "2023", status: "Completed", score: "80%" },
      { year: "2022", status: "Completed", score: "74%" },
      { year: "2021", status: "Completed", score: "70%" },
    ]
  },
  "barangay-8": {
    id: "barangay-8",
    name: "New Cebu",
    population: 13800,
    households: 3450,
    area: 16.9,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "84%" },
      { year: "2023", status: "Completed", score: "78%" },
      { year: "2022", status: "Completed", score: "73%" },
      { year: "2021", status: "Completed", score: "68%" },
    ]
  },
  "barangay-9": {
    id: "barangay-9",
    name: "Palili",
    population: 5420,
    households: 1355,
    area: 7.8,
    surveyStatus: "Pending",
    history: [
      { year: "2024", status: "Pending", score: "N/A" },
      { year: "2023", status: "Completed", score: "65%" },
      { year: "2022", status: "Completed", score: "62%" },
      { year: "2021", status: "Completed", score: "58%" },
    ]
  },
  "barangay-10": {
    id: "barangay-10",
    name: "Talas",
    population: 8960,
    households: 2240,
    area: 12.3,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "81%" },
      { year: "2023", status: "Completed", score: "75%" },
      { year: "2022", status: "Completed", score: "69%" },
      { year: "2021", status: "Completed", score: "64%" },
    ]
  },
  "barangay-11": {
    id: "barangay-11",
    name: "Carre",
    population: 6780,
    households: 1695,
    area: 9.1,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "77%" },
      { year: "2023", status: "Completed", score: "71%" },
      { year: "2022", status: "Completed", score: "66%" },
      { year: "2021", status: "Completed", score: "62%" },
    ]
  },
  "barangay-12": {
    id: "barangay-12",
    name: "Buguis",
    population: 10300,
    households: 2575,
    area: 13.6,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "85%" },
      { year: "2023", status: "Completed", score: "79%" },
      { year: "2022", status: "Completed", score: "73%" },
      { year: "2021", status: "Completed", score: "68%" },
    ]
  },
  "barangay-13": {
    id: "barangay-13",
    name: "McKinley",
    population: 7890,
    households: 1972,
    area: 10.7,
    surveyStatus: "Pending",
    history: [
      { year: "2024", status: "Pending", score: "N/A" },
      { year: "2023", status: "Completed", score: "69%" },
      { year: "2022", status: "Completed", score: "65%" },
      { year: "2021", status: "Completed", score: "60%" },
    ]
  },
  "barangay-14": {
    id: "barangay-14",
    name: "Kiblagon",
    population: 9870,
    households: 2467,
    area: 12.9,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "80%" },
      { year: "2023", status: "Completed", score: "74%" },
      { year: "2022", status: "Completed", score: "68%" },
      { year: "2021", status: "Completed", score: "63%" },
    ]
  },
  "barangay-15": {
    id: "barangay-15",
    name: "Laperas",
    population: 6540,
    households: 1635,
    area: 8.9,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "82%" },
      { year: "2023", status: "Completed", score: "76%" },
      { year: "2022", status: "Completed", score: "70%" },
      { year: "2021", status: "Completed", score: "65%" },
    ]
  },
  "barangay-16": {
    id: "barangay-16",
    name: "Clib",
    population: 8120,
    households: 2030,
    area: 11.2,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "78%" },
      { year: "2023", status: "Completed", score: "72%" },
      { year: "2022", status: "Completed", score: "67%" },
      { year: "2021", status: "Completed", score: "62%" },
    ]
  },
  "barangay-17": {
    id: "barangay-17",
    name: "Osmena",
    population: 11650,
    households: 2912,
    area: 14.8,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "87%" },
      { year: "2023", status: "Completed", score: "81%" },
      { year: "2022", status: "Completed", score: "75%" },
      { year: "2021", status: "Completed", score: "71%" },
    ]
  },
  "barangay-18": {
    id: "barangay-18",
    name: "Luparan",
    population: 7320,
    households: 1830,
    area: 9.8,
    surveyStatus: "Pending",
    history: [
      { year: "2024", status: "Pending", score: "N/A" },
      { year: "2023", status: "Completed", score: "67%" },
      { year: "2022", status: "Completed", score: "63%" },
      { year: "2021", status: "Completed", score: "59%" },
    ]
  },
  "barangay-19": {
    id: "barangay-19",
    name: "Poblacion",
    population: 16800,
    households: 4200,
    area: 20.3,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "89%" },
      { year: "2023", status: "Completed", score: "83%" },
      { year: "2022", status: "Completed", score: "78%" },
      { year: "2021", status: "Completed", score: "74%" },
    ]
  },
  "barangay-20": {
    id: "barangay-20",
    name: "Tagolilong",
    population: 5890,
    households: 1472,
    area: 8.1,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "76%" },
      { year: "2023", status: "Completed", score: "70%" },
      { year: "2022", status: "Completed", score: "65%" },
      { year: "2021", status: "Completed", score: "61%" },
    ]
  },
  "barangay-21": {
    id: "barangay-21",
    name: "Lapla",
    population: 9450,
    households: 2362,
    area: 12.6,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "84%" },
      { year: "2023", status: "Completed", score: "78%" },
      { year: "2022", status: "Completed", score: "72%" },
      { year: "2021", status: "Completed", score: "67%" },
    ]
  },
  "barangay-22": {
    id: "barangay-22",
    name: "Litos",
    population: 7140,
    households: 1785,
    area: 9.5,
    surveyStatus: "Pending",
    history: [
      { year: "2024", status: "Pending", score: "N/A" },
      { year: "2023", status: "Completed", score: "66%" },
      { year: "2022", status: "Completed", score: "62%" },
      { year: "2021", status: "Completed", score: "58%" },
    ]
  },
  "barangay-23": {
    id: "barangay-23",
    name: "Parami",
    population: 8670,
    households: 2167,
    area: 11.4,
    surveyStatus: "In Progress",
    history: [
      { year: "2024", status: "In Progress", score: "79%" },
      { year: "2023", status: "Completed", score: "73%" },
      { year: "2022", status: "Completed", score: "68%" },
      { year: "2021", status: "Completed", score: "63%" },
    ]
  },
  "barangay-24": {
    id: "barangay-24",
    name: "Labon",
    population: 6230,
    households: 1557,
    area: 8.6,
    surveyStatus: "Completed",
    history: [
      { year: "2024", status: "Completed", score: "81%" },
      { year: "2023", status: "Completed", score: "75%" },
      { year: "2022", status: "Completed", score: "69%" },
      { year: "2021", status: "Completed", score: "64%" },
    ]
  },
  "barangay-25": {
    id: "barangay-25",
    name: "Waterfall",
    population: 4890,
    households: 1222,
    area: 6.9,
    surveyStatus: "Pending",
    history: [
      { year: "2024", status: "Pending", score: "N/A" },
      { year: "2023", status: "Completed", score: "64%" },
      { year: "2022", status: "Completed", score: "60%" },
      { year: "2021", status: "Completed", score: "56%" },
    ]
  }
};