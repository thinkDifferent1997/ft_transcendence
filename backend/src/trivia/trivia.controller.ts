import { Controller, Get } from "@nestjs/common";
import { TriviaService } from "./trivia.service";

@Controller("api/trivia")
export class TriviaController
{
    constructor(
        private readonly triviaService: TriviaService,
    ) {}

	@Get("questions")
	getQuestions()
	{
		return this.triviaService.getQuestions();
	}
}
