package com.example.crossword.mapper;

import com.example.crossword.dtoGame.GameDto;
import com.example.crossword.enitity.Game;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.mapstruct.AfterMapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface GameMapper {
    @Mapping(source = "hints_used", target = "hintsUsed")
    @Mapping(source = "game_over", target = "gameOver")
    @Mapping(source = "solved_words_count", target = "solvedWordsCount")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "crossword.id", target = "crosswordId")
    GameDto toDTO(Game game);
    
    @AfterMapping
    default void setIsPaused(Game game, @MappingTarget GameDto gameDto) {
        gameDto.setPaused(game.is_paused());
    }

    @Mapping(source = "hintsUsed", target = "hints_used")
    @Mapping(source = "gameOver", target = "game_over")
    @Mapping(target = "user", ignore = true)
    @Mapping(source = "solvedWordsCount", target = "solved_words_count")
    @Mapping(target = "crossword", ignore = true)
    Game toEntity(GameDto gameDto);
    
    @AfterMapping
    default void setGamePaused(GameDto gameDto, @MappingTarget Game game) {
        game.set_paused(gameDto.isPaused());
    }
}
