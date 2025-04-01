import {Router} from 'express';
import {registerUser , LoginUser, LogoutUser, RefreshAccessToken} from '../controllers/User.Controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { varifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    ]),
    registerUser)

router.route('/login').post(LoginUser)

router.route('/logout').post( varifyJwt ,LogoutUser);

router.route('/refresh-token').post(RefreshAccessToken);


export default router;  