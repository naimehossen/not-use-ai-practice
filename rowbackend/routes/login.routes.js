import express from 'express'
import { get, register } from '../controllers/login.controller.js';

const router=express.Router()


router.post("/register",register)

router.get("/get",get)


export default router;