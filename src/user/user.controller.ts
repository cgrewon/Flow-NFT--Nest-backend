import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as Cli from './cli.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';



@Controller('user')
export class UserController {

  MinterAddress = process.env.MINTER_ADDRESS;

  constructor(private readonly userService: UserService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('userid/:id')
  async findOne(@Param('id') id: string) {    
    return await this.userService.findOne(+id);
  }

  @Get('user_address/:address')
  async findByAddress(@Param('address') address: string) {    
    return await this.userService.findByAddress(address);
  }

  @Get('test')
  async testAccountNfts(){
    try{
      const res = await Cli.getAccountNFTs(this.MinterAddress);
      return {
        status: HttpStatus.OK,
        data: res,
        count: Array.isArray(res) ? res.length : -1
      };
    }catch(ex){
      return {
        status: HttpStatus.BAD_REQUEST,
        error: ex
      };
    }
  }

  @Post('mine_req')
  async mintNftTransfer(
    @Body('address')address : string,    
    @Body('cidMetadataLink')cidMetadataLink : string
  ){

    try{
      const lastNft = await Cli.mintNft(cidMetadataLink);
      
      if (lastNft === null) {
        return {
          status: HttpStatus.CONFLICT,
          error:{
            message: 'Server is busy.'
          }
        };
      }     
      console.log('lastNft.id: ' , lastNft.id);
      const nftId = await Cli.transferNft(address, lastNft.id);
      return {
        status: HttpStatus.OK,
        data: nftId
      };
    }catch(ex){
      return {
        status: HttpStatus.BAD_REQUEST,
        error: ex
      };
    }
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
