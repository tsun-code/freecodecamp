# freeCodeCamp.org

##### Learn to code.

##### Build projects.

##### Earn certifications.




### Tips for myself

+ One liner to add prefix to files in a folder with sequential numbers
```
ls -vrt | cat -n | while read n f; do mv -i "$f" "$(printf %02d $n). $f" ; done
```