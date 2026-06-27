import { Module } from "@nestjs/common";
import { TriviaController } from "./trivia.controller";
import { TriviaService } from "./trivia.service";

@Module({
    controllers: [TriviaController],
    providers: [TriviaService],
})
export class TriviaModule {}
