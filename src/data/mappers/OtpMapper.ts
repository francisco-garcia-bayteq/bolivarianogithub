
import {OtpValidationResponse} from "../models/OtpValidationResponse.ts";
import {Otp} from "../../domain/entities/Otp.ts";

export function mapOtpContentToEntity(
  model: OtpValidationResponse,
): Otp {
  return {message: model.userMessage};
}
