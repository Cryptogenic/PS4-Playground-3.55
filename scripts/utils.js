function debug_log(msg)
{
    $.ajax({
     url: '/debug/log/',
     type: 'POST',
     contentType: 'text/html',
     data: msg,
     processData: false,
     async: false
  });
}

function debug_bin(bin)
{
    $.ajax({
     url: 'bin/',
     type: 'POST',
     contentType: 'application/octet-stream',
     data: bin,
     processData: false,
     async: false
  });
}

function read_str(buf,index)
{
  ret = ''
  while(true)
  {
    dword = buf[index/4]
    c1 = dword % 256
    c2 = (dword >> 8) % 256
    c3 = (dword >> 16) % 256
    c4 = (dword >> 24) % 256
    if(c1 == 0)
      break;
    ret += String.fromCharCode(c1)
    if(c2 == 0)
      break;
    ret += String.fromCharCode(c2)
    if(c3 == 0)
      break;
    ret += String.fromCharCode(c3)
    if(c4 == 0)
      break;
    ret += String.fromCharCode(c4)
    index+=4;
  }
  return ret;
}

function int2hex(value, digits) {
	value = value.toString(16);
	while (value.length < digits) {
		value = "0" + value;
	}

	return value;
}

/*
  Functions from Xerpi
*/

function set_buf_addr(addr) {
	cbuf[0x14] = addr.getLowBitsUnsigned();
	cbuf[0x15] = addr.getHighBitsUnsigned();
}

function set_buf_size(size) {
	cbuf[0x1E] = size;
}

function get_buf_addr() {
	return new dcodeIO.Long(cbuf[0x14], cbuf[0x15], true);
}

function get_buf_size() {
	return cbuf[0x1E];
}

function u32_to_u64(hi, lo) {
	return new dcodeIO.Long(lo, hi, true);
}

function read_str8(buf, index)
{
	ret = ''
	while(true) {
		c = buf[index];
		if (c == 0)
			break;
		ret += String.fromCharCode(c);
		index++;
	}
	return ret;
}

function hex32(s)
{
	return ('00000000' + s).substr(-8);
}

function hex16(s)
{
	return ('0000' + s).slice(-4)
}

function hex8(s)
{
	return ('00' + s).substr(-2);
}

function decimalToHexString(num)
{
	return (num < 0 ? (0xFFFFFFFF + num + 1) : num).toString(16).toUpperCase();
}

function get_addr(addr) {
		if (typeof(addr) != "number") {
			return addr.sub(get_buf_addr()).getLowBitsUnsigned();
		}
		return addr;
	}

function read8(addr) {
	return (read32(get_addr(addr)) >>> ((get_addr(addr) % 4) * 8)) & 0xFF;
}

function write8(addr, val) {
	addr = get_addr(addr);
	data = read32(addr) & ~(0xFF << ((addr % 4) * 8));
	data |= val << ((addr % 4) * 8);
	write32(addr, data);
}

function write16(addr, val) {
	addr = get_addr(addr);
	data = read32(addr) & ~(0xFFFF << (((addr >>> 1) & 1) * 16));
	data |= val << (((addr >>> 1) & 1) * 16);
	write32(addr, data);
}

function write32(addr, val) {
	rop_buf[Math.floor(get_addr(addr)/4)] = val;
}

function write64_long(addr, val) {
	addr = get_addr(addr);
	rop_buf[Math.floor(addr/4)] = val.getLowBitsUnsigned();
	rop_buf[Math.floor(addr/4) + 1] = val.getHighBitsUnsigned();
}

function write64(addr, hi, lo) {
	addr = get_addr(addr);
	rop_buf[Math.floor(addr/4)] = lo;
	rop_buf[Math.floor(addr/4) + 1] = hi;
}

function read16(addr) {
	return read8(addr) | (read8(addr + 1) << 8);
}

function read32(addr) {
	return rop_buf[Math.floor(get_addr(addr)/4)];
}

function read64(addr) {
	return new dcodeIO.Long(read32(get_addr(addr)),
		read32(get_addr(addr) + 4), true)
}

function write_str(addr, str)
{
	var i;
	addr = get_addr(addr);
	for (i = 0; i < str.length; i++) {
		write8(addr + i, str.charCodeAt(i));
	}
	write8(addr + i, 0);
}

function read_data8(addr, size)
{
	addr = get_addr(addr);

	var v = new Uint8Array(size);
	for (var i = 0; i < size; i++) {
		v[i] = read8(addr + i);
	}
	return v;
}

function read_data32(addr, size)
{
	addr = get_addr(addr);

	var v = new Uint32Array(Math.floor(size/4));
	for (var i = 0; i < size; i++) {
		v[i] = read32(addr + i * 4);
	}
	return v;
}

function array_to_string(array)
{
	var str = "";
	for (var i = 0; i < array.length; i++) {
		str += String.fromCharCode(array[i]);
	}
	return str;
}

function read64_abs(addr) {
	var old_size = get_buf_size();
	var old_addr = get_buf_addr();
	set_buf_size(8);
	set_buf_addr(addr);
	var qword = new dcodeIO.Long(rop_buf[0], rop_buf[1], true);
	set_buf_size(old_size);
	set_buf_addr(old_addr);
	return qword;
}

function stack_get_addr()
{
	return stack_ptr;
}

function stack_set_addr(addr)
{
	stack_ptr = addr;
}

function stack_alloc(size) {
	var old_ptr = stack_ptr;
	if (old_ptr % size != 0) {
		old_ptr += size - (old_ptr % size);
	}
	stack_ptr = old_ptr + size;
	return get_buf_addr().add(old_ptr);
}

function stack_memalign(size, align) {
	var old_ptr = stack_ptr;
	if (old_ptr % align != 0) {
		old_ptr += align - (old_ptr % align);
	}
	stack_ptr = old_ptr + size;
	return get_buf_addr().add(old_ptr);
}

function stack_reset() {
	stack_ptr = initial_stack_ptr;
}

function parse_dents(dents, size)
{
	var files = [];
	var addr = get_addr(dents);

	for (var i = 0; i < size;) {
		var reclen = read16(addr + i + 4);
		var type = read8(addr + i + 6);
		var namlen = read8(addr + i + 7);
		var name = read_data8(addr + i + 8, namlen);
		files.push({
			name: array_to_string(name),
			type: type
		});
		i += reclen;
	}
	return files;
}

function has_access(addr) {
	return write(2, addr.add(PAGE_SIZE - 1).and(~(PAGE_SIZE - 1)), PAGE_SIZE) !== EFAULT;
}

function get_accessible_boundaries(addr) {

	var addr = addr.and(~(PAGE_SIZE - 1));

	while (!has_access(addr)) {
		addr = addr.sub(PAGE_SIZE);
	}

	while (has_access(addr)) {
		addr = addr.sub(PAGE_SIZE);
	}

	var start_addr = addr.add(PAGE_SIZE);
	var end_addr = start_addr;

	while (has_access(end_addr)) {
		end_addr = end_addr.add(PAGE_SIZE);
	}

	end_addr = end_addr.sub(PAGE_SIZE);

	return {
		start: start_addr,
		end: end_addr,
		size: end_addr.sub(start_addr).getLowBitsUnsigned()
	}
}

function dir_tree(dir, nrec, send) {
	var stack = stack_get_addr();

	var fd = open(dir, O_RDONLY, 0);

	var dents = stack_alloc(2048);
	var dents_size = getdents(fd, dents, 2048);

	var files = parse_dents(dents, dents_size);
	for (var i = 0; i < files.length; i++) {
		var full_name = (dir != "/" ? dir : "") + "/" + files[i].name;
		debug_log(Array(nrec + 1).join("\t") + filetype_char(files[i].type) + " " + full_name);
		if (files[i].type == DT_DIR && files[i].name !== "." && files[i].name !== "..") {
			dir_tree(full_name, nrec + 1);
		} else if (files[i].type === DT_REG && send) {
			sendfile_net(full_name);
		}
	}

	close(fd);

	stack_set_addr(stack);
}

/*
  Wrap two uint32s into double precision
*/

function u2d(low, hi)
{
    if (!_dview)
        _dview = new DataView(new ArrayBuffer(16));

    _dview.setUint32(0, hi);
    _dview.setUint32(4, low);
    return _dview.getFloat64(0)
}

/*
  Unwrap uints from double
*/

function d2u(d)
{
    if (!_dview)
        _dview = new DataView(new ArrayBuffer(16));

    _dview.setFloat64(0, d);
    return { low: _dview.getUint32(4), hi: _dview.getUint32(0) }
}
