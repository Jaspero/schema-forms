#!/bin/bash
while true; do
  echo "I am watching you" >"$PWD"/dist/watcher.txt
  refresh=0
  for f in "$PWD"/dist; do
    find=$(find "$f" -type f)
    while read -r f2; do
      v=${f2//[^[:alpha:]]/}
      r=$(md5sum "$f2")
      if [ "$r" != "${!v}" ]; then
        refresh=1
      fi
      eval "${v}=\$r"
    done <<<"$find"
  done

  rm -rf "$PWD"/dist/watcher.txt
  if [ "$refresh" -eq "1" ]; then
    echo "Copying to node_modules..."
    cp ./dist/. ./node_modules/@jaspero -R
  fi
  sleep 5
done
