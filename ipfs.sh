# bash

cout() {
  echo >&1 $@
}

cerr() {
  echo >&2 $@
}

die() {
  cerr "error:" $@
  exit 1
}

usage() {
  cout $@
  exit 0
}

require() {
  which "$1" >/dev/null || die "please install $1"
}

tmpfile() {
  mkdir -p /tmp/binfs
  date=$(date +"%Y-%m-%dT%H:%M:%SZ")
  fpath=$(mktemp "/tmp/binfs/code.$date.XXXXXX")
  echo "$fpath"
}

checkIpfs() {
  require ipfs
  $(echo foo | ipfs add --pin=false -Q | ipfs cat >/dev/null) || die "failed to add/cat from ipfs. is ipfs running?"
}

checkUserSafety() {
  unsafe="$1"
  if [ "$unsafe" != "1" ]; then
    cerr "WARNING: executing arbitrary content from the internet is very dangerous"
    cerr "         you must demonstrate you acknowledge this and know what you are doing"
    cerr "         to continue, run this again with the following option:"
    cerr ""
    cerr "         $0 --unsafe"
    exit 1
  fi
}
