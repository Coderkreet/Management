import { User } from "../models/User.model..js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import uploadResult from "../utils/Cloudinary.js";

const registerUser = AsyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: "User registered successfully",
  // });

  const { fullName, email, username, password } = req.body;
  //   console.log(email, password);

  // Check if all fields are filled
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill in all fields");
  }

  //check if user already exists
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarFileLocalPath = req.files?.avatar?.[0]?.path;

  let coverImgLocal;
  if (req.files?.coverImage?.[0]?.path) {
    coverImgLocal = req.files.coverImage[0].path; // Ensure coverImgLocal is valid
  }

  if (!avatarFileLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Upload avatar image to Cloudinary
  const avatar = await uploadResult(avatarFileLocalPath);

  // Upload cover image to Cloudinary if it exists
  let coverImage = null;
  if (coverImgLocal) {
    coverImage = await uploadResult(coverImgLocal);
  }

  if (!avatar) {
    throw new ApiError(500, "Error uploading avatar image");
  }

  const newUser = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error creating user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User created successfully")
  );
});

export default registerUser;
