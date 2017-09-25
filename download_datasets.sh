#!/usr/bin/env sh
for dataset in D12 D13 D14 D15 J14 W14 Q14
do
    if [ ! -f ./$dataset.tgz ]
    then
        curl http://acl-arc.comp.nus.edu.sg/archives/acl-arc-160301-parscit/$dataset.tgz -o $dataset.tgz
    fi
    tar -x -k -f $dataset.tgz -C ./datasets/
done


find ./datasets/ -mindepth 2 -type f -exec mv -i -n '{}' ./datasets/ ';'
rm -rf ./datasets/*/
rm -rf ./*.tgz
