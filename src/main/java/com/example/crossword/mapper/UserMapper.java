package com.example.crossword.mapper;
import com.example.crossword.dtoUser.UserDto;
import com.example.crossword.dtoUser.UserRegAuthDto;
import com.example.crossword.enitity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import org.mapstruct.AfterMapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    
    @AfterMapping
    default void setIsAdmin(User user, @MappingTarget UserDto userDto) {
        userDto.setIsAdmin(user.is_admin());
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "games", ignore = true)
    @Mapping(target = "password", ignore = true)
    User toEntity(UserRegAuthDto userRegAuthDto);
    
    @AfterMapping
    default void setUserAdmin(UserRegAuthDto userRegAuthDto, @MappingTarget User user) {
        user.set_admin(false);
    }

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "games", ignore = true)
    void updateEntity(UserDto userDto, @MappingTarget User user);
    
    @AfterMapping
    default void updateUserAdmin(UserDto userDto, @MappingTarget User user) {
        user.set_admin(userDto.isAdmin());
    }
}
