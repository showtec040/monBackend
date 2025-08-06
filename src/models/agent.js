const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    nomComplet: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    telephone: {
        type: String,
        required: true,
        trim: true
    },
    departement: {
        type: String,
        required: true,
        trim: true
    },
    fonction: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true,
        trim: true
    },
    matricule: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    photo: {
        type: String,
        default: '/uploads/default_user.png'
    },
    nomPere: { type: String },
    nomMere: { type: String },
    nationalite: { type: String },
    province: { type: String },
    territoire: { type: String },
    adresse: { type: String },
    dateNaissance: { type: Date },
    lieuNaissance: { type: String },
    sexe: { type: String, enum: ["Masculin", "Féminin"] },
    pieceIdentite: { type: String, enum: ["Carte d'électeur", "Permis", "Passport"] },
    numeroPiece: { type: String },
    Diplome: { type: String, enum: ["Graduat", "Licence", "Master", "Doctorat","Deux 6 (diplôme d’état)","Brevet"] },
    documents: [{ type: String }], // URLs ou base64 ou fichiers
    statut: { type: String, default: "en attente de mise à jour" },
    numeroInscription: { type: Number },
    rapportPresence: { type: Array, default: [] },
    niveauAcces: { type: Number, default: 0 },
accesExpireAt: { type: Date },
   empreinteId: {
    type: Schema.Types.ObjectId, // ou String si vous préférez
    ref: 'Empreinte', // optionnel, si vous avez une collection Empreinte
    default: null
  }
},
    { timestamps: true });

agentSchema.index({ departement: 1, numeroInscription: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
