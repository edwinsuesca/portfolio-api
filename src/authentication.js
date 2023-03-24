import * as jose from 'jose';

export const authentication = async (req, res, next) => {
  if(!req.headers.authorization){
    req.auth = {
      "status":false,
      "message":"FORBIDDEN",
      "code": 403
    };
    return res.status(req.auth.code).send({ message: req.auth.message })
  }
  let token = req.headers.authorization.replace(/['"]+/g, '');
  req.auth = await tokenVerify(token, false);
  next();
}

export const verifyToken = async(req, res) => {
  try{
    let auth;
    if(!req.headers.Authorization){
      auth = {
        "status":false,
        "message":"FORBIDDEN",
        "code": 403
      };
    }
    let token = req.headers.authorization.replace(/['"]+/g, '');
    auth = await tokenVerify(token, true);
    res.status(200).json(auth);
  } catch {
    res.status(500).send({ message: 'Internal server error', error: err });
  }
}

async function tokenVerify (token, renewToken) {
    // extract token from request
    const encoder = new TextEncoder();
    let message = "FORBIDDEN";
    let errorCode = 403;
    try {
      // verify token
      const { payload, protectedHeader } = await jose.jwtVerify(token, encoder.encode(process.env.JWT_PRIVATE_KEY));
      message = "VERIFIED_OK";

      if(renewToken){
        const newToken = await generateNewToken(token);
        if(newToken !== null){
          return {
            "username":payload.username,
            "status":true,
            "message":message,
            "token": newToken, //Se envía un nuevo token (provisional) que expira en una hora
            "code": 202
          };
        } else{
          // Falta más de una hora o ya caducó token
          return {
            "username":payload.username,
            "status":true,
            "message":message,
            "code": 202
          };
        }
      } else {
        return {
          "username":payload.username,
          "status":true,
          "message":message,
          "code": 202
        };
      }
      
    } catch (err) {
      // token verification failed
      if(err.code == 'ERR_JWT_EXPIRED'){
        message = "SESSION_EXPIRED";
        errorCode = 401;
      } else{
          message = "FORBIDDEN";
          errorCode = 403;
      }
      //ERR_JWS_INVALID
      //ERR_JWS_SIGNATURE_VERIFICATION_FAILED
      return {
        "status":false,
        "message":message,
        "code": errorCode
      };
    }
}

async function generateNewToken(token){
  const encoder = new TextEncoder();
  const decodedToken = jose.decodeJwt(token);
  const givenDate = new Date(decodedToken.exp * 1000);
  const currentTime = Date.now();
  const oneHourInMs = 60 * 60 * 1000;

  if (givenDate.getTime() - currentTime <= oneHourInMs) {
    // Falta una hora o menos.
    const id = decodedToken.id;
    const username = decodedToken.username;
    const jwtConstructor = new jose.SignJWT({id, username});
    const token = await jwtConstructor
    .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
    .setIssuedAt().setExpirationTime('1h').sign(encoder.encode(process.env.JWT_PRIVATE_KEY));
    return token;
  } else{
    return null;
  }
}