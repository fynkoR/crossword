package com.example.crossword.mapper;

import com.example.crossword.dtoGame.GameDto;
import com.example.crossword.enitity.Game;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GameMapper {
    @Mapping(source = "hints_used", target = "hintsUsed")
    @Mapping(source = "gameOver", target = "gameOver")
    @Mapping(source = "solved_words_count", target = "solvedWordsCount")
    @Mapping(source = "paused", target = "paused")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "crossword.id", target = "crosswordId")
    GameDto toDTO(Game game);

    @Mapping(source = "hintsUsed", target = "hints_used")
    @Mapping(source = "gameOver", target = "gameOver")
    @Mapping(target = "user", ignore = true)
    @Mapping(source = "paused", target = "paused")
    @Mapping(source = "solvedWordsCount", target = "solved_words_count")
    @Mapping(target = "crossword", ignore = true)
    Game toEntity(GameDto gameDto);
}
