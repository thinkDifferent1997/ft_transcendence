import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ChatMessageDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @Length(1, 500)
    content!: string;
}
