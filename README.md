# freeCodeCamp.org

##### Learn to code.

##### Build projects.

##### Earn certifications.

### Important Notes

**Do not store any passwords or sensitive data** on your public github repositories. If you have mistakenly stored any of them, you may follow the instructions from the following links to remove them:

[Removing sensitive data from a repository](https://help.github.com/en/github/authenticating-to-github/removing-sensitive-data-from-a-repository)

[Using BFG Repo Cleaner tool to remove sensitive files from your git repo](https://github.com/IBM/BluePic/wiki/Using-BFG-Repo-Cleaner-tool-to-remove-sensitive-files-from-your-git-repo)


### Tips for myself

+ One liner to add prefix to files in a folder with sequential numbers
```
ls -vrt | cat -n | while read n f; do mv -i "$f" "$(printf %02d $n)-$f" ; done
```

+ A great tool for renaming files in batch

[rename — Homebrew Formulae](https://formulae.brew.sh/formula/rename)

[Rename files in bash with Regular Expressions](https://swapps.com/blog/rename-files-in-bash-with-regular-expresions/)
