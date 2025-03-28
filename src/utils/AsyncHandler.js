// promise

const AsyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default AsyncHandler;

// Try Catch bolok

// const asyncHandler =(fn)=> async(req , res , next)=>{
// try {
//     await fn(req,res,next)
// } catch (error) {
//     res.status(error.code || 500).json({
//         success :false,
//         message : error.message
//     })
// }

// }
