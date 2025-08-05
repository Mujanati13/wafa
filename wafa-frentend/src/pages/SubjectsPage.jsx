import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaPlay, FaRedo, FaChevronDown } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { SiBookstack } from "react-icons/si";
const SubjectsPage = () => {
  const [showModel, setShowmodal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Course data with exam details
  const courseData = {
    "nephro-uro": {
      name: "Néphrologie/Urologie",
      image: "🫘",
      categories: [
        {
          id: "biochemistry",
          name: "Les bases biochimiques",
          subcategories: [
            { id: "biochemistry-basic", name: "Bases fondamentales" },
            { id: "biochemistry-advanced", name: "Biochimie avancée" },
            { id: "biochemistry-clinical", name: "Biochimie clinique" },
          ],
        },
        {
          id: "clinical",
          name: "Clinique",
          subcategories: [
            { id: "clinical-basics", name: "Bases cliniques" },
            { id: "clinical-advanced", name: "Clinique avancée" },
            { id: "clinical-practice", name: "Pratique clinique" },
          ],
        },
        {
          id: "diagnostic",
          name: "Diagnostic",
          subcategories: [
            { id: "diagnostic-imaging", name: "Imagerie diagnostique" },
            { id: "diagnostic-laboratory", name: "Diagnostic biologique" },
            { id: "diagnostic-clinical", name: "Diagnostic clinique" },
          ],
        },
        {
          id: "treatment",
          name: "Traitement",
          subcategories: [
            { id: "treatment-medical", name: "Traitement médical" },
            { id: "treatment-surgical", name: "Traitement chirurgical" },
            { id: "treatment-preventive", name: "Traitement préventif" },
          ],
        },
      ],
      exams: [
        {
          id: "amylose",
          name: "Amylose",
          questions: 11,
          completed: 0,
          progress: 0,
          description: "Mai 2024 Q 28",
          category: "biochemistry",
          subcategory: "biochemistry-clinical",
        },
        {
          id: "intro-nephro",
          name: "Intro néphrologie",
          questions: 2,
          completed: 1,
          progress: 80,
          description: "Introduction course",
          category: "clinical",
          subcategory: "clinical-basics",
        },
        {
          id: "nephro-hereditaire",
          name: "Nephro héréditaire",
          questions: 35,
          completed: 0,
          progress: 0,
          description: "Hereditary nephrology",
          category: "clinical",
          subcategory: "clinical-advanced",
        },
        {
          id: "nephro-diabetique",
          name: "Nephro diabétique",
          questions: 40,
          completed: 0,
          progress: 0,
          description: "Diabetic nephrology",
          category: "diagnostic",
          subcategory: "diagnostic-clinical",
        },
        {
          id: "nephro-lupique",
          name: "Nephro lupique",
          questions: 30,
          completed: 0,
          progress: 0,
          description: "Lupus nephrology",
          category: "diagnostic",
          subcategory: "diagnostic-laboratory",
        },
        {
          id: "glomerulo",
          name: "Glomérulonéphrite extra capillaire",
          questions: 19,
          completed: 0,
          progress: 0,
          description: "Extracapillary glomerulonephritis",
          category: "treatment",
          subcategory: "treatment-medical",
        },
        {
          id: "lgm",
          name: "Lgm",
          questions: 20,
          completed: 0,
          progress: 0,
          description: "LGM course",
          category: "biochemistry",
          subcategory: "biochemistry-basic",
        },
        {
          id: "hsf",
          name: "HSF",
          questions: 20,
          completed: 0,
          progress: 0,
          description: "HSF course",
          category: "biochemistry",
          subcategory: "biochemistry-advanced",
        },
        {
          id: "insuffisance-renale",
          name: "Insuffisance rénale chronique",
          questions: 45,
          completed: 12,
          progress: 27,
          description: "Chronic kidney disease management",
          category: "clinical",
          subcategory: "clinical-practice",
        },
        {
          id: "dialyse",
          name: "Dialyse et hémodialyse",
          questions: 38,
          completed: 0,
          progress: 0,
          description: "Dialysis techniques and management",
          category: "treatment",
          subcategory: "treatment-surgical",
        },
      ],
    },
    cardiologie: {
      name: "Cardiologie",
      image: "❤️",
      categories: [
        {
          id: "arrhythmia",
          name: "Troubles du rythme",
          subcategories: [
            { id: "arrhythmia-basic", name: "Bases des troubles du rythme" },
            { id: "arrhythmia-advanced", name: "Troubles complexes" },
            { id: "arrhythmia-treatment", name: "Traitement des troubles" },
          ],
        },
        {
          id: "ischemic",
          name: "Cardiopathie ischémique",
          subcategories: [
            { id: "ischemic-acute", name: "Syndromes coronariens aigus" },
            { id: "ischemic-chronic", name: "Cardiopathie chronique" },
            { id: "ischemic-prevention", name: "Prévention" },
          ],
        },
        {
          id: "heart-failure",
          name: "Insuffisance cardiaque",
          subcategories: [
            { id: "heart-failure-acute", name: "Insuffisance aiguë" },
            { id: "heart-failure-chronic", name: "Insuffisance chronique" },
            { id: "heart-failure-treatment", name: "Traitement" },
          ],
        },
        {
          id: "valvular",
          name: "Valvulopathies",
          subcategories: [
            { id: "valvular-diagnosis", name: "Diagnostic" },
            { id: "valvular-treatment", name: "Traitement" },
            { id: "valvular-surgery", name: "Chirurgie valvulaire" },
          ],
        },
      ],
      exams: [
        {
          id: "ecg-basics",
          name: "ECG de base",
          questions: 25,
          completed: 18,
          progress: 72,
          description: "Basic ECG interpretation",
          category: "arrhythmia",
          subcategory: "arrhythmia-basic",
        },
        {
          id: "infarctus",
          name: "Infarctus du myocarde",
          questions: 42,
          completed: 8,
          progress: 19,
          description: "Acute myocardial infarction",
          category: "ischemic",
          subcategory: "ischemic-acute",
        },
        {
          id: "fibrillation-auriculaire",
          name: "Fibrillation auriculaire",
          questions: 28,
          completed: 0,
          progress: 0,
          description: "Atrial fibrillation management",
          category: "arrhythmia",
          subcategory: "arrhythmia-advanced",
        },
        {
          id: "insuffisance-cardiaque",
          name: "Insuffisance cardiaque",
          questions: 35,
          completed: 15,
          progress: 43,
          description: "Heart failure pathophysiology",
          category: "heart-failure",
        },
        {
          id: "valvulopathies",
          name: "Valvulopathies",
          questions: 33,
          completed: 0,
          progress: 0,
          description: "Cardiac valve diseases",
          category: "valvular",
        },
        {
          id: "hypertension",
          name: "Hypertension artérielle",
          questions: 29,
          completed: 22,
          progress: 76,
          description: "Arterial hypertension management",
          category: "ischemic",
        },
        {
          id: "pericardite",
          name: "Péricardite",
          questions: 18,
          completed: 0,
          progress: 0,
          description: "Pericardial diseases",
          category: "heart-failure",
        },
        {
          id: "cardiopathie-congenitale",
          name: "Cardiopathies congénitales",
          questions: 31,
          completed: 5,
          progress: 16,
          description: "Congenital heart diseases",
          category: "valvular",
        },
      ],
    },
    pneumologie: {
      name: "Pneumologie",
      image: "🫁",
      categories: [
        { id: "infectious", name: "Infectieux" },
        { id: "oncology", name: "Oncologie" },
        { id: "chronic", name: "Maladies chroniques" },
        { id: "emergency", name: "Urgences" },
      ],
      exams: [
        {
          id: "pneumonie",
          name: "Pneumonie communautaire",
          questions: 27,
          completed: 20,
          progress: 74,
          description: "Community-acquired pneumonia",
          category: "infectious",
        },
        {
          id: "tuberculose",
          name: "Tuberculose pulmonaire",
          questions: 32,
          completed: 0,
          progress: 0,
          description: "Pulmonary tuberculosis",
          category: "infectious",
        },
        {
          id: "cancer-poumon",
          name: "Cancer du poumon",
          questions: 38,
          completed: 12,
          progress: 32,
          description: "Lung cancer diagnosis and staging",
          category: "oncology",
        },
        {
          id: "bpco",
          name: "BPCO",
          questions: 34,
          completed: 28,
          progress: 82,
          description: "Chronic obstructive pulmonary disease",
          category: "chronic",
        },
        {
          id: "asthme",
          name: "Asthme",
          questions: 26,
          completed: 15,
          progress: 58,
          description: "Asthma management",
          category: "chronic",
        },
        {
          id: "embolie-pulmonaire",
          name: "Embolie pulmonaire",
          questions: 23,
          completed: 0,
          progress: 0,
          description: "Pulmonary embolism",
          category: "emergency",
        },
        {
          id: "fibrose-pulmonaire",
          name: "Fibrose pulmonaire",
          questions: 21,
          completed: 7,
          progress: 33,
          description: "Pulmonary fibrosis",
          category: "chronic",
        },
      ],
    },
    gastroenterologie: {
      name: "Gastroentérologie",
      image: "🫃",
      categories: [
        { id: "hepatology", name: "Hépatologie" },
        { id: "inflammatory", name: "Inflammatoire" },
        { id: "oncology", name: "Oncologie" },
        { id: "functional", name: "Troubles fonctionnels" },
      ],
      exams: [
        {
          id: "cirrhose",
          name: "Cirrhose hépatique",
          questions: 36,
          completed: 0,
          progress: 0,
          description: "Hepatic cirrhosis",
          category: "hepatology",
        },
        {
          id: "hepatite-b",
          name: "Hépatite B",
          questions: 24,
          completed: 18,
          progress: 75,
          description: "Hepatitis B infection",
          category: "hepatology",
        },
        {
          id: "mici",
          name: "MICI (Crohn, RCH)",
          questions: 41,
          completed: 12,
          progress: 29,
          description: "Inflammatory bowel diseases",
          category: "inflammatory",
        },
        {
          id: "cancer-colorectal",
          name: "Cancer colorectal",
          questions: 33,
          completed: 0,
          progress: 0,
          description: "Colorectal cancer screening",
          category: "oncology",
        },
        {
          id: "syndrome-intestin-irritable",
          name: "Syndrome intestin irritable",
          questions: 19,
          completed: 14,
          progress: 74,
          description: "Irritable bowel syndrome",
          category: "functional",
        },
        {
          id: "pancreatite",
          name: "Pancréatite aiguë",
          questions: 28,
          completed: 0,
          progress: 0,
          description: "Acute pancreatitis",
          category: "inflammatory",
        },
      ],
    },
    neurologie: {
      name: "Neurologie",
      image: "🧠",
      categories: [
        { id: "vascular", name: "Vasculaire" },
        { id: "degenerative", name: "Dégénératif" },
        { id: "inflammatory", name: "Inflammatoire" },
        { id: "epilepsy", name: "Épilepsie" },
      ],
      exams: [
        {
          id: "avc",
          name: "Accident vasculaire cérébral",
          questions: 44,
          completed: 22,
          progress: 50,
          description: "Stroke management",
          category: "vascular",
        },
        {
          id: "parkinson",
          name: "Maladie de Parkinson",
          questions: 31,
          completed: 0,
          progress: 0,
          description: "Parkinson's disease",
          category: "degenerative",
        },
        {
          id: "alzheimer",
          name: "Maladie d'Alzheimer",
          questions: 29,
          completed: 15,
          progress: 52,
          description: "Alzheimer's disease",
          category: "degenerative",
        },
        {
          id: "sclerose-plaques",
          name: "Sclérose en plaques",
          questions: 37,
          completed: 0,
          progress: 0,
          description: "Multiple sclerosis",
          category: "inflammatory",
        },
        {
          id: "epilepsie",
          name: "Épilepsie",
          questions: 26,
          completed: 20,
          progress: 77,
          description: "Epilepsy management",
          category: "epilepsy",
        },
        {
          id: "cephalees",
          name: "Céphalées et migraines",
          questions: 22,
          completed: 8,
          progress: 36,
          description: "Headaches and migraines",
          category: "vascular",
        },
      ],
    },
    endocrinologie: {
      name: "Endocrinologie",
      image: "🦋",
      categories: [
        { id: "diabetes", name: "Diabète" },
        { id: "thyroid", name: "Thyroïde" },
        { id: "adrenal", name: "Surrénales" },
        { id: "reproductive", name: "Hormones reproductrices" },
      ],
      exams: [
        {
          id: "diabete-type1",
          name: "Diabète type 1",
          questions: 32,
          completed: 25,
          progress: 78,
          description: "Type 1 diabetes management",
          category: "diabetes",
        },
        {
          id: "diabete-type2",
          name: "Diabète type 2",
          questions: 38,
          completed: 10,
          progress: 26,
          description: "Type 2 diabetes management",
          category: "diabetes",
        },
        {
          id: "hyperthyroidie",
          name: "Hyperthyroïdie",
          questions: 24,
          completed: 0,
          progress: 0,
          description: "Hyperthyroidism",
          category: "thyroid",
        },
        {
          id: "hypothyroidie",
          name: "Hypothyroïdie",
          questions: 21,
          completed: 16,
          progress: 76,
          description: "Hypothyroidism",
          category: "thyroid",
        },
        {
          id: "syndrome-cushing",
          name: "Syndrome de Cushing",
          questions: 18,
          completed: 0,
          progress: 0,
          description: "Cushing's syndrome",
          category: "adrenal",
        },
      ],
    },
    rhumatologie: {
      name: "Rhumatologie",
      image: "🦴",
      categories: [
        { id: "inflammatory", name: "Inflammatoire" },
        { id: "degenerative", name: "Dégénératif" },
        { id: "metabolic", name: "Métabolique" },
        { id: "autoimmune", name: "Auto-immune" },
      ],
      exams: [
        {
          id: "polyarthrite-rhumatoide",
          name: "Polyarthrite rhumatoïde",
          questions: 35,
          completed: 0,
          progress: 0,
          description: "Rheumatoid arthritis",
          category: "autoimmune",
        },
        {
          id: "arthrose",
          name: "Arthrose",
          questions: 28,
          completed: 22,
          progress: 79,
          description: "Osteoarthritis",
          category: "degenerative",
        },
        {
          id: "goutte",
          name: "Goutte",
          questions: 20,
          completed: 15,
          progress: 75,
          description: "Gout management",
          category: "metabolic",
        },
        {
          id: "spondylarthrite",
          name: "Spondylarthrite ankylosante",
          questions: 26,
          completed: 0,
          progress: 0,
          description: "Ankylosing spondylitis",
          category: "inflammatory",
        },
        {
          id: "lupus",
          name: "Lupus érythémateux",
          questions: 33,
          completed: 8,
          progress: 24,
          description: "Systemic lupus erythematosus",
          category: "autoimmune",
        },
      ],
    },
    hematologie: {
      name: "Hématologie",
      image: "🩸",
      categories: [
        { id: "anemia", name: "Anémies" },
        { id: "malignant", name: "Hémopathies malignes" },
        { id: "coagulation", name: "Troubles coagulation" },
        { id: "transfusion", name: "Transfusion" },
      ],
      exams: [
        {
          id: "anemie-ferriprive",
          name: "Anémie ferriprive",
          questions: 23,
          completed: 18,
          progress: 78,
          description: "Iron deficiency anemia",
          category: "anemia",
        },
        {
          id: "leucemie-aigue",
          name: "Leucémie aiguë",
          questions: 39,
          completed: 0,
          progress: 0,
          description: "Acute leukemia",
          category: "malignant",
        },
        {
          id: "lymphome",
          name: "Lymphomes",
          questions: 34,
          completed: 12,
          progress: 35,
          description: "Lymphoma classification",
          category: "malignant",
        },
        {
          id: "thrombopenie",
          name: "Thrombopénie",
          questions: 19,
          completed: 0,
          progress: 0,
          description: "Thrombocytopenia",
          category: "coagulation",
        },
      ],
    },
    dermatologie: {
      name: "Dermatologie",
      image: "🫥",
      categories: [
        { id: "inflammatory", name: "Inflammatoire" },
        { id: "infectious", name: "Infectieux" },
        { id: "oncology", name: "Oncologie" },
        { id: "allergic", name: "Allergique" },
      ],
      exams: [
        {
          id: "eczema",
          name: "Eczéma atopique",
          questions: 22,
          completed: 16,
          progress: 73,
          description: "Atopic dermatitis",
          category: "inflammatory",
        },
        {
          id: "psoriasis",
          name: "Psoriasis",
          questions: 27,
          completed: 0,
          progress: 0,
          description: "Psoriasis management",
          category: "inflammatory",
        },
        {
          id: "melanome",
          name: "Mélanome",
          questions: 31,
          completed: 8,
          progress: 26,
          description: "Melanoma diagnosis",
          category: "oncology",
        },
        {
          id: "mycoses",
          name: "Mycoses cutanées",
          questions: 18,
          completed: 12,
          progress: 67,
          description: "Cutaneous mycoses",
          category: "infectious",
        },
      ],
    },
    psychiatrie: {
      name: "Psychiatrie",
      image: "🧘",
      categories: [
        { id: "mood", name: "Troubles de l'humeur" },
        { id: "anxiety", name: "Troubles anxieux" },
        { id: "psychotic", name: "Troubles psychotiques" },
        { id: "addiction", name: "Addictions" },
      ],
      exams: [
        {
          id: "depression",
          name: "Épisode dépressif majeur",
          questions: 29,
          completed: 20,
          progress: 69,
          description: "Major depressive episode",
          category: "mood",
        },
        {
          id: "trouble-bipolaire",
          name: "Trouble bipolaire",
          questions: 33,
          completed: 0,
          progress: 0,
          description: "Bipolar disorder",
          category: "mood",
        },
        {
          id: "schizophrenie",
          name: "Schizophrénie",
          questions: 36,
          completed: 15,
          progress: 42,
          description: "Schizophrenia spectrum",
          category: "psychotic",
        },
        {
          id: "trouble-anxieux",
          name: "Troubles anxieux",
          questions: 25,
          completed: 18,
          progress: 72,
          description: "Anxiety disorders",
          category: "anxiety",
        },
        {
          id: "addiction-alcool",
          name: "Addiction à l'alcool",
          questions: 28,
          completed: 0,
          progress: 0,
          description: "Alcohol use disorder",
          category: "addiction",
        },
      ],
    },
    pediatrie: {
      name: "Pédiatrie",
      image: "👶",
      categories: [
        { id: "neonatology", name: "Néonatologie" },
        { id: "infectious", name: "Infectieux" },
        { id: "development", name: "Développement" },
        { id: "emergency", name: "Urgences" },
      ],
      exams: [
        {
          id: "vaccination",
          name: "Calendrier vaccinal",
          questions: 21,
          completed: 19,
          progress: 90,
          description: "Pediatric vaccination schedule",
          category: "infectious",
        },
        {
          id: "bronchiolite",
          name: "Bronchiolite",
          questions: 18,
          completed: 0,
          progress: 0,
          description: "Bronchiolitis management",
          category: "infectious",
        },
        {
          id: "croissance",
          name: "Troubles de la croissance",
          questions: 26,
          completed: 12,
          progress: 46,
          description: "Growth disorders",
          category: "development",
        },
        {
          id: "convulsions-febriles",
          name: "Convulsions fébriles",
          questions: 15,
          completed: 10,
          progress: 67,
          description: "Febrile seizures",
          category: "emergency",
        },
      ],
    },
    gynecologie: {
      name: "Gynécologie-Obstétrique",
      image: "🤱",
      categories: [
        { id: "pregnancy", name: "Grossesse" },
        { id: "gynecology", name: "Gynécologie" },
        { id: "contraception", name: "Contraception" },
        { id: "oncology", name: "Oncologie" },
      ],
      exams: [
        {
          id: "suivi-grossesse",
          name: "Suivi de grossesse",
          questions: 35,
          completed: 28,
          progress: 80,
          description: "Pregnancy monitoring",
          category: "pregnancy",
        },
        {
          id: "endometriose",
          name: "Endométriose",
          questions: 24,
          completed: 0,
          progress: 0,
          description: "Endometriosis management",
          category: "gynecology",
        },
        {
          id: "contraception",
          name: "Méthodes contraceptives",
          questions: 19,
          completed: 15,
          progress: 79,
          description: "Contraceptive methods",
          category: "contraception",
        },
        {
          id: "cancer-sein",
          name: "Cancer du sein",
          questions: 41,
          completed: 8,
          progress: 20,
          description: "Breast cancer screening",
          category: "oncology",
        },
      ],
    },
    ophtalmologie: {
      name: "Ophtalmologie",
      image: "👁️",
      categories: [
        { id: "glaucoma", name: "Glaucome" },
        { id: "retinal", name: "Rétinopathies" },
        { id: "refractive", name: "Troubles réfractifs" },
        { id: "emergency", name: "Urgences" },
      ],
      exams: [
        {
          id: "glaucome",
          name: "Glaucome chronique",
          questions: 22,
          completed: 0,
          progress: 0,
          description: "Chronic glaucoma",
          category: "glaucoma",
        },
        {
          id: "retinopathie-diabetique",
          name: "Rétinopathie diabétique",
          questions: 28,
          completed: 20,
          progress: 71,
          description: "Diabetic retinopathy",
          category: "retinal",
        },
        {
          id: "cataracte",
          name: "Cataracte",
          questions: 16,
          completed: 12,
          progress: 75,
          description: "Cataract surgery",
          category: "refractive",
        },
      ],
    },
    orl: {
      name: "ORL",
      image: "👂",
      categories: [
        { id: "ear", name: "Oreille" },
        { id: "nose", name: "Nez" },
        { id: "throat", name: "Gorge" },
        { id: "oncology", name: "Oncologie" },
      ],
      exams: [
        {
          id: "otite",
          name: "Otites",
          questions: 20,
          completed: 16,
          progress: 80,
          description: "Otitis management",
          category: "ear",
        },
        {
          id: "sinusite",
          name: "Sinusite",
          questions: 18,
          completed: 0,
          progress: 0,
          description: "Sinusitis treatment",
          category: "nose",
        },
        {
          id: "angine",
          name: "Angines",
          questions: 15,
          completed: 12,
          progress: 80,
          description: "Pharyngitis management",
          category: "throat",
        },
      ],
    },
    "med-legal": {
      name: "Med legal-éthique-travail",
      image: "⚖️",
      categories: [
        { id: "ethics", name: "Éthique" },
        { id: "legal", name: "Légal" },
        { id: "work", name: "Travail" },
      ],
      exams: [
        {
          id: "ethics",
          name: "Éthique médicale",
          questions: 25,
          completed: 0,
          progress: 0,
          category: "ethics",
        },
        {
          id: "legal",
          name: "Médecine légale",
          questions: 30,
          completed: 0,
          progress: 0,
          category: "legal",
        },
        {
          id: "work",
          name: "Médecine du travail",
          questions: 20,
          completed: 0,
          progress: 0,
          category: "work",
        },
        {
          id: "certificats",
          name: "Certificats médicaux",
          questions: 16,
          completed: 8,
          progress: 50,
          description: "Medical certificates",
          category: "legal",
        },
        {
          id: "consentement",
          name: "Consentement éclairé",
          questions: 14,
          completed: 12,
          progress: 86,
          description: "Informed consent",
          category: "ethics",
        },
      ],
    },
    synthese: {
      name: "Synthèse thérapeutique",
      image: "💊",
      categories: [{ id: "synthesis", name: "Synthèse" }],
      exams: [
        {
          id: "synthesis",
          name: "Synthèse thérapeutique",
          questions: 35,
          completed: 0,
          progress: 0,
          difficulty: "medium",
          category: "synthesis",
        },
        {
          id: "polypathologie",
          name: "Polypathologie du sujet âgé",
          questions: 28,
          completed: 15,
          progress: 54,
          description: "Elderly polypathology",
          category: "synthesis",
        },
      ],
    },
    "sante-publique": {
      name: "Santé publique",
      image: "📊",
      categories: [
        { id: "public-health", name: "Santé publique" },
        { id: "epidemiology", name: "Épidémiologie" },
        { id: "prevention", name: "Prévention" },
      ],
      exams: [
        {
          id: "public-health",
          name: "Santé publique",
          questions: 40,
          completed: 0,
          progress: 0,
          difficulty: "medium",
          category: "public-health",
        },
        {
          id: "epidemiologie",
          name: "Épidémiologie analytique",
          questions: 32,
          completed: 20,
          progress: 63,
          description: "Analytical epidemiology",
          category: "epidemiology",
        },
        {
          id: "depistage",
          name: "Dépistage et prévention",
          questions: 26,
          completed: 18,
          progress: 69,
          description: "Screening and prevention",
          category: "prevention",
        },
      ],
    },
  };

  const course = courseData[courseId];

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="text-gray-900 text-center">Course not found</div>
      </div>
    );
  }

  // Filter exams based on selected category and subcategory
  const filteredExams = course.exams.filter((exam) => {
    if (selectedCategory === "all") return true;
    if (exam.category !== selectedCategory) return false;
    if (selectedSubcategory === "all") return true;
    return exam.subcategory === selectedSubcategory;
  });

  const handleExamStart = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleReset = (examId) => {
    // Reset logic would go here
    console.log(`Reset exam: ${examId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedCategoryName = (() => {
    if (selectedCategory === "all") return "Toutes les catégories";
    const category = course.categories.find(
      (cat) => cat.id === selectedCategory
    );
    return category ? category.name : "Toutes les catégories";
  })();

  const selectedSubcategoryName = (() => {
    if (selectedSubcategory === "all") return "Toutes les sous-catégories";
    const category = course.categories.find(
      (cat) => cat.id === selectedCategory
    );
    if (!category || !category.subcategories)
      return "Toutes les sous-catégories";
    const subcategory = category.subcategories.find(
      (sub) => sub.id === selectedSubcategory
    );
    return subcategory ? subcategory.name : "Toutes les sous-catégories";
  })();

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("all"); // Reset subcategory when category changes
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-15 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/home")}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{course.image}</div>

            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          </div>
        </div>
        <div className="flex h-[80px] w-full bg-white/70 rounded-xl shadow-md mt-6 mb-4 overflow-hidden border border-blue-100">
          <button
            className="flex-1 flex flex-col items-center justify-center transition-all duration-200 hover:bg-blue-50 focus:bg-blue-100 group relative"
            onClick={() => {}}
          >
            <span className="text-blue-700 font-semibold text-lg flex items-center gap-2">
              Par examen
            </span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
          <div className="w-[1px] bg-blue-100 h-2/3 self-center"></div>
          <button
            className="flex-1 flex flex-col items-center justify-center transition-all duration-200 hover:bg-teal-50 focus:bg-teal-100 group relative"
            onClick={() => {}}
          >
            <span className="text-teal-700 font-semibold text-lg flex items-center gap-2">
              Par chapitre
            </span>
            <span className="absolute bottom-0 left-0 w-full h-1 bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-blue-400 rounded-lg border border-gray-200 p-4 z-[1000]">
          {/* Categories and Subcategories Layout */}
          <div className="space-y-4">
            {course.categories.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Category */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleCategorySelect(category.id)}
                    className={`text-left font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "text-blue-600 font-semibold"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {category.name}
                  </button>
                </div>

                {/* Subcategories - Show for all categories, not just selected ones */}
                {category.subcategories && (
                  <div className="ml-6 flex flex-wrap gap-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          handleSubcategorySelect(subcategory.id);
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.id &&
                          selectedSubcategory === subcategory.id
                            ? "bg-teal-500 text-white shadow-md"
                            : selectedCategory === category.id &&
                              selectedSubcategory === "all"
                            ? "bg-teal-100 text-teal-700 border border-teal-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" || selectedSubcategory !== "all") && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-sm font-medium text-blue-800 mb-2">
                Filtres actifs :
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Catégorie : {selectedCategoryName}
                  </span>
                )}
                {selectedSubcategory !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    Sous-catégorie : {selectedSubcategoryName}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubcategory("all");
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Effacer tous les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Results Summary */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Résultats ({filteredExams.length} examens)
              </h3>
              {(selectedCategory !== "all" ||
                selectedSubcategory !== "all") && (
                <p className="text-sm text-gray-600 mt-1">
                  Filtré par : {selectedCategoryName}
                  {selectedSubcategory !== "all" &&
                    ` > ${selectedSubcategoryName}`}
                </p>
              )}
            </div>
            {filteredExams.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <p className="text-gray-500">
                  Aucun examen trouvé avec les filtres actuels
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubcategory("all");
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Exam Grid */}
        {filteredExams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {filteredExams.map((exam, index) => (
              <motion.div
                onClick={() => handleExamStart(exam.id)}
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Exam Image Placeholder */}
                <div className="h-32 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                  <div className="text-white text-4xl">
                    <SiBookstack />
                  </div>
                  <span
                    className="absolute top-1 right-4 h-10 w-10 bg-blue-800 text-white rounded-full flex items-center justify-center text-[20px]  hover:rounded-2xl duration-500 cursor-pointer"
                    onClick={() => setShowmodal(true)}
                  >
                    ?
                  </span>
                </div>

                {/* Exam Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-900 font-semibold">{exam.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        exam.difficulty
                      )}`}
                    >
                      {exam.difficulty}
                    </span>
                  </div>

                  {exam.description && (
                    <div className="text-gray-600 text-sm mb-2">
                      {exam.description}
                    </div>
                  )}

                  {exam.correction && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-3">
                      Correction : {exam.correction}
                    </span>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>
                      {exam.completed} / {exam.questions} Questions
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-blue-600">
                        {exam.progress}% Complete
                      </span>
                    </div>
                    <div className="bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${exam.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {showModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => setShowmodal(false)}
              aria-label="Fermer"
            >
              <IoCloseSharp size={28} />
            </button>
            <div className="flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Information sur l'examen
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Êtes-vous prêt à commencer cet examen&nbsp;? Assurez-vous
                d'avoir le temps nécessaire et d'être dans un environnement
                calme. Bonne chance&nbsp;!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
