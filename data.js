const materias = [
  {
    anio: "Primero", semestres: [
      {
        numero: "1º semestre", materias: [
          { id: "bio_intro", nombre: "Introducción a la Biología Celular y Molecular" },
          { id: "bioest", nombre: "Introducción a la Bioestadística" },
          { id: "bioetica", nombre: "Salud y Humanidades y Bioética" },
          { id: "at1", nombre: "Aprendizaje en Territorio 1" }
        ]
      },
      {
        numero: "2º semestre", materias: [
          { id: "bio", nombre: "Biología Celular y Molecular", previas: ["bio_intro"] },
          { id: "at2", nombre: "Aprendizaje en Territorio 2", previas: ["at1"] }
        ]
      }
    ]
  },
  {
    anio: "Segundo", semestres: [
      {
        numero: "3º semestre", materias: [
          { id: "anatomia", nombre: "Anatomía (CBCC2)", previas: ["bioetica"] },
          { id: "histobiof", nombre: "Histología y Biofísica (CBCC2)", previas: ["bio"] }
        ]
      },
      {
        numero: "4º semestre", materias: [
          { id: "histoneuro", nombre: "Histología (Neuro y Cardio)", previas: ["bio"] },
          { id: "neuro", nombre: "Neurociencias", previas: ["bio"] },
          { id: "cardioresp", nombre: "Cardiovascular y Respiratorio", previas: ["bio"] }
        ]
      }
    ]
  },
  {
    anio: "Tercero", semestres: [
      {
        numero: "5º semestre", materias: [
          { id: "cbcc5", nombre: "Digestivo, Renal, Endocrino, Metabólico y Reproductor", previas: ["bio", "anatomia"] }
        ]
      },
      {
        numero: "6º semestre", materias: [
          { id: "b6", nombre: "Hematología e Inmunobiología", previas: ["bio"] },
          { id: "met1", nombre: "Metodología Científica 1", previas: ["bioest", "cbcc5"] }
        ]
      }
    ]
  },
  {
    anio: "Cuarto", semestres: [
      {
        numero: "7º semestre", materias: [
          { id: "m4pna", nombre: "Medicina en el Primer Nivel de Atención", previas: ["cbcc5", "b6", "met1"] },
          { id: "m4bcp", nombre: "Bases Científicas de la Patología", previas: ["cbcc5", "b6", "met1"] }
        ]
      },
      {
        numero: "8º semestre", materias: [
          { id: "pediatria", nombre: "Pediatría", previas: ["cbcc5", "b6", "met1"] },
          { id: "gineco", nombre: "Ginecología y Neonatología", previas: ["cbcc5", "b6", "met1"] }
        ]
      }
    ]
  },
  {
    anio: "Quinto", semestres: [
      {
        numero: "9º y 10º semestre", materias: [
          { id: "clinica", nombre: "Clínica Médica", previas: ["m4pna", "m4bcp"] },
          { id: "patomed", nombre: "Patología Médica y Terapéutica", previas: ["m4bcp"] }
        ]
      }
    ]
  },
  {
    anio: "Sexto", semestres: [
      {
        numero: "11º y 12º semestre", materias: [
          { id: "clinicaq", nombre: "Clínica Quirúrgica", previas: ["m4pna", "m4bcp"] },
          { id: "patoquir", nombre: "Patología Quirúrgica", previas: ["m4bcp"] },
          { id: "mfc", nombre: "MFC – Salud Mental en Comunidad – Psicología Médica", previas: ["m4pna"] },
          { id: "met2", nombre: "Metodología Científica 2", previas: ["m4pna", "m4bcp"] }
        ]
      }
    ]
  },
  {
    anio: "Séptimo", semestres: [
      {
        numero: "13º y 14º semestre", materias: [
          { id: "internado", nombre: "Internado Obligatorio", previas: ["clinica", "patomed", "clinicaq", "patoquir", "mfc", "met2"] }
        ]
      }
    ]
  }
];
