import { Express, Response, Request, NextFunction } from "express";
import { Result, validationResult } from "express-validator";


export interface IValidationError {
    type?: string, // Tipo de error ("field", "alternative", etc.)
    msg?: string, // El mensaje que mostraste con .withMessage()
    path: string, // pathEl nombre del campo que falló ("email", "edad")
    location ?: string // Dónde estaba el campo ("body", "query", "params")
    value ?: string
}

export const validate = (validations : Array<any>) => {
    return async(req : Request, res : Response, next : NextFunction) => {
        await Promise.all(validations.map(validation => validation.run(req)))
        const errors  = validationResult(req)
        if (errors.isEmpty()){
            return next()
        }
        const errorsMessages = errors.array()
        
        return res.status(400).json({ statusCode : 400, status : "error", errors : errorsMessages})
    }
}


// (errors.array())
// [
//     {
//         type: "field",
//         msg: "email inválido",
//         path: "email",
//         location: "body",
//         value: "noEsEmail"
//     },
//     {
//         type: "field",
//         msg: "edad mínima 18",
//         path: "edad",
//         location: "body",
//         value: 15
//     }


// errors = Result {
//     // métodos disponibles
//     isEmpty: () => false,
//     array: () => [...],
//     mapped: () => {...},
//     formatWith: (fn) => ...
// }