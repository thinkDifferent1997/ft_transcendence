import { Module } from "@nestjs/common";
import { TriviaModule } from "../trivia/trivia.module";
import { GameManager } from "./game.manager";

@Module({
	imports: [TriviaModule],
    providers: [GameManager],
    exports: [GameManager],
})
export class GameModule {}
