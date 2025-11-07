package com.example.crossword.mapper;
import com.example.crossword.dtoUser.UserDto;
import com.example.crossword.dtoUser.UserRegAuthDto;
import com.example.crossword.enitity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "games", ignore = true)
    @Mapping(target = "is_admin", constant = "false")
    User toEntity(UserRegAuthDto userRegAuthDto);

    void updateEntity(UserDto userDto, @MappingTarget User user);
}
