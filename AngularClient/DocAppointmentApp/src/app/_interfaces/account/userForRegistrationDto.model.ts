export interface UserForRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  personalId: string;
  emailValidationCode? :string;
  password?: string;
  rating?: number;
  viewCount?: number;
  imageUrl?: string;
  categoryId?: string;
}
