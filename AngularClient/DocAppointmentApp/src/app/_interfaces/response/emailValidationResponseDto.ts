export interface EmailValidationResponseDto {
    isSuccessfulEmailValidation: boolean;
    error: string;
    minutesLeftForToken: number;
}