import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

class ChoiceDto {
  @IsString()
  @MinLength(1, { message: 'Le texte du choix ne peut pas être vide.' })
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class ImportQuestionDto {
  @IsString()
  @MinLength(5, { message: 'La question doit faire au moins 5 caractères.' })
  text!: string;

  @IsString()
  @MinLength(1, { message: 'La catégorie est obligatoire.' })
  category!: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Il faut au moins 2 choix de réponse.' })
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices!: ChoiceDto[];
}

export class ImportQuestionsBatchDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Le fichier doit contenir au moins une question.' })
  @ValidateNested({ each: true })
  @Type(() => ImportQuestionDto)
  questions!: ImportQuestionDto[];
}