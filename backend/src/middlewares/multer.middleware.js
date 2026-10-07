import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Keep files in memory — uploaded directly to ImageKit, no disk I/O
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX'),
      false,
    );
  }
};

// 10 MB limit
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
