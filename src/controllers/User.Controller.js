import { User } from "../models/User.model..js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import uploadResult from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";


const GenerateAccessAndRefreshToken = async (userId)=>{
  try {
    const user = await User.findById(userId)
  const accessToken =  user.generateAccessToken();
  const refreshToken =  user.generateAccessToken();
  // console.log("Access Token:", accessToken);
  // console.log("Refresh Token:", refreshToken);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
}

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

const LoginUser = AsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Please fill in all fields");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await existedUser.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(
    existedUser._id
  );

  const LoggedinUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  ); // Add `await` here to resolve the query

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: LoggedinUser, // Now this will be the resolved user document
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const LogoutUser = AsyncHandler(async (req, res) => {
await User.findByIdAndUpdate(

  req.user._id,
  { 
$set:{
  refreshToken: undefined
}

   },
  { new: true }
)

const options ={
  httpOnly: true,
  secure : true,
 }

 return res.status(200)
 .clearCookie("refreshToken" , options)
  .clearCookie("accessToken" , options)
  .json(
    new ApiResponse(200, null, "User logged out successfully")
  );

})

const RefreshAccessToken = AsyncHandler(async (req, res) => {
try {
  const incommingRefreshToken = req.cookies.refreshToken || req.headers("Authorization")?.replace("Bearer", "");
  if (!incommingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }
  const decoded = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, "Invalid refresh token");
  }
  
  if(user.refreshToken !== incommingRefreshToken) {
    throw new ApiError(403, "Invalid refresh token");
  }
  
  options = {
    httpOnly: true,
    secure: true,
  };
  
  const {accessToken , refreshToken} = await GenerateAccessAndRefreshToken(user._id);
  
  return res.status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
  .json(
    new ApiResponse(
      200 , 
      {
        accessToken , refreshToken
      },
      "Access token refreshed successfully"
    )
  )
} catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).json(new ApiError(401, "Token expired"));
  } else if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json(new ApiError(401, "Invalid token"));
  } else {
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
  
}

})

const changeCurrentPassword  = AsyncHandler( async (req, res) => {
const {oldPassword , newPassword} = req.body;
if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
  throw new ApiError(400, "Please fill in all fields"); 
}
const existedUser = await User.findById(req.user._id);
const isPasswordMatch = await user.existedUser.isPasswordMatch(oldPassword);
if (!isPasswordMatch) {
  throw new ApiError(401, "Invalid password");
}
 
user.password = newPassword;
await user.save({ validateBeforeSave: false });
return res.status(200).json(
  new ApiResponse(200, null, "Password changed successfully")
)

})

const getcurrentUser = AsyncHandler(async(req, res) => {

  return res.status(200).json(
    new ApiResponse(200, req.user, "User fetched successfully")
  )
})

const updateAcountDetails = AsyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body;
  

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
   { $set :{
      fullName,
      email,
      username: username.toLowerCase(),
      
    }},
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User updated successfully")
  );
})

const updateAvatar = AsyncHandler(async (req, res) => {
  const avatarFileLocalPath = req.file?.path;

  if (!avatarFileLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Upload avatar image to Cloudinary
  const avatar = await uploadResult(avatarFileLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Error uploading avatar image");
  }

  // Update user avatar in the database
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User avatar updated successfully")
  );
});


const updateCoverImage = AsyncHandler(async (req, res) => {
  const CoverFileLocalPath = req.file?.path;

  if (!CoverFileLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  // Upload avatar image to Cloudinary
  const coverImage = await uploadResult(CoverFileLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "Error uploading Cover image");
  }

  // Update user avatar in the database
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User coverImage updated successfully")
  );
});

export {registerUser , LoginUser , LogoutUser , RefreshAccessToken
, changeCurrentPassword , getcurrentUser , updateAcountDetails , updateAvatar , updateCoverImage  };
};
