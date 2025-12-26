import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Veuillez télécharger une image valide"), false);
  }
};

// File filter for PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Veuillez télécharger un fichier PDF valide"), false);
  }
};

// File filter for Excel files
const excelFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv" // .csv
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Veuillez télécharger un fichier Excel valide (.xlsx, .xls, .csv)"), false);
  }
};

// Upload middleware for profile pictures
export const uploadProfilePicture = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: imageFilter,
}).single("profilePicture");

// Upload middleware for PDFs
export const uploadPDF = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for PDFs
  },
  fileFilter: pdfFilter,
});

// Upload to Cloudinary from buffer
export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "wafa-profiles",
        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Upload middleware for question images (multiple)
export const uploadQuestionImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per image
  },
  fileFilter: imageFilter,
}).array("images", 10); // Max 10 images

// Upload middleware for Excel files
export const uploadExcelFile = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: excelFilter,
}).single("file");

// Upload multiple images to Cloudinary
export const uploadImagesToCloudinary = async (files, folder = "wafa-questions") => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: "limit",
              quality: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              originalName: file.originalname,
            });
          }
        }
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  });

  return Promise.all(uploadPromises);
};

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

export default {
  uploadProfilePicture,
  uploadPDF,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadQuestionImages,
  uploadImagesToCloudinary,
  uploadExcelFile
};
