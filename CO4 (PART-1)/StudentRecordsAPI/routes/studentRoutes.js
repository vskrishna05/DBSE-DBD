import express from 'express';

import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';

const router = express.Router();


// CREATE
router.post('/', createStudent);


// READ ALL
router.get('/', getAllStudents);


// READ ONE
router.get('/:id', getStudentById);


// UPDATE
router.patch('/:id', updateStudent);


// DELETE
router.delete('/:id', deleteStudent);


export default router;