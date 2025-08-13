const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;
const MONGO_URL = 'mongodb://127.0.0.1:27017/portfolio';


mongoose.connect('mongodb://127.0.0.1:27017/portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log(' MongoDB connected successfully');
}).catch((err) => {
  console.error(' MongoDB connection error:', err);
});

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) { cb(null, uploadsDir); },
  filename: function (_req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tech: [String],
  imageUrl: String,
  link: String,
  grade: Number
}, { timestamps: true });
const Project = mongoose.model('Project', ProjectSchema);

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  iconUrl: String
}, { timestamps: true });
const Skill = mongoose.model('Skill', SkillSchema);

const TopicSchema = new mongoose.Schema({
  section: { type: String, enum: ['introduction','backend','frontend'], required: true },
  name: { type: String, required: true },
  grade: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });
const Topic = mongoose.model('Topic', TopicSchema);

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true },
  message: { type: String, required: true, minlength: 10, maxlength: 1000 },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Message = mongoose.model('Message', MessageSchema);

const StatSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: { type: Number, default: 0 }
});
const Stat = mongoose.model('Stat', StatSchema);

app.get('/cv', async (_req, res) => {
  const cvFile = path.join(uploadsDir, 'cv.pdf');
  if (!fs.existsSync(cvFile)) return res.status(404).send('CV not found');
  const key = 'cvDownloads';
  let stat = await Stat.findOne({ key });
  if (!stat) stat = await Stat.create({ key, value: 0 });
  stat.value += 1;
  await stat.save();
  res.download(cvFile, 'CV-Youstina-Sameh-Fahim.pdf');
});

app.get('/api/projects', async (req, res) => {
  const q = (req.query.q || '').toString();
  const rx = new RegExp(q, 'i');
  const filter = q ? { $or: [{ title: rx }, { description: rx }, { tech: rx }] } : {};
  const items = await Project.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

app.get('/api/projects/:id', async (req, res) => {
  const item = await Project.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: item });
});

app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { title, description, tech, link, grade } = req.body;
    const techArr = (tech || '').split(',').map(t => t.trim()).filter(Boolean);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const item = await Project.create({
      title,
      description,
      tech: techArr,
      link,
      grade: grade ? Number(grade) : undefined,
      imageUrl
    });
    res.status(201).json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, tech, link, grade, keepImage } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (tech !== undefined) update.tech = (tech || '').split(',').map(t => t.trim()).filter(Boolean);
    if (link !== undefined) update.link = link;
    if (grade !== undefined) update.grade = Number(grade);
    if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;
    if (!req.file && keepImage === 'false') update.imageUrl = '';
    const item = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.delete('/api/projects/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: true });
});

app.get('/api/skills', async (_req, res) => {
  const items = await Skill.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

app.post('/api/skills', upload.single('icon'), async (req, res) => {
  try {
    const { name, level } = req.body;
    const iconUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const item = await Skill.create({ name, level, iconUrl });
    res.status(201).json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.put('/api/skills/:id', upload.single('icon'), async (req, res) => {
  try {
    const { name, level, keepIcon } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (level !== undefined) update.level = level;
    if (req.file) update.iconUrl = `/uploads/${req.file.filename}`;
    if (!req.file && keepIcon === 'false') update.iconUrl = '';
    const item = await Skill.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.delete('/api/skills/:id', async (req, res) => {
  await Skill.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: true });
});

app.get('/api/topics', async (_req, res) => {
  const items = await Topic.find().sort({ section: 1, name: 1 });
  res.json({ success: true, data: items });
});

app.post('/api/topics', async (req, res) => {
  try {
    const { section, name, grade } = req.body;
    const item = await Topic.create({ section, name, grade: Number(grade) || 0 });
    res.status(201).json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.put('/api/topics/:id', async (req, res) => {
  try {
    const { section, name, grade } = req.body;
    const item = await Topic.findByIdAndUpdate(req.params.id, { section, name, grade: Number(grade) }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.delete('/api/topics/:id', async (req, res) => {
  await Topic.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: true });
});

app.get('/api/messages', async (_req, res) => {
  const items = await Message.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const item = await Message.create({ name, email, message });
    res.status(201).json({ success: true, data: item });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.put('/api/messages/:id/read', async (req, res) => {
  const item = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: item });
});

app.delete('/api/messages/:id', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: true });
});

app.get('/api/stats', async (_req, res) => {
  const projects = await Project.find().select('createdAt').lean();
  const skills = await Skill.find().select('level').lean();
  const messages = await Message.countDocuments();
  const cvStat = await Stat.findOne({ key: 'cvDownloads' });

  const projByYearMap = {};
  for (const p of projects) {
    const d = p.createdAt ? new Date(p.createdAt) : new Date();
    const y = d.getFullYear();
    projByYearMap[y] = (projByYearMap[y] || 0) + 1;
  }
  const projByYear = Object.entries(projByYearMap)
    .map(([y, c]) => ({ _id: Number(y), count: Number(c) }))
    .sort((a, b) => a._id - b._id);

  const skillByLevelMap = {};
  for (const s of skills) {
    const lvl = (s.level || 'beginner').toString();
    skillByLevelMap[lvl] = (skillByLevelMap[lvl] || 0) + 1;
  }
  const skillByLevel = Object.entries(skillByLevelMap)
    .map(([k, v]) => ({ _id: k, count: Number(v) }));

  res.json({
    totals: {
      projects: projects.length,
      skills: skills.length,
      messages,
      cvDownloads: cvStat ? cvStat.value : 0
    },
    projByYear,
    skillByLevel
  });
});

app.listen(PORT, () => console.log(` API http://localhost:${PORT}`));
