## step to run blockchain explorer on osx

> To run the blockchain explorer, you must use node version 9.x.x

1. go to the set up script path 
```
cd instruction/osx
```

2. change mod of setup.sh to grant executing permission
```
chmod +x setup.sh
```

3. run set-up script
```
./setup.sh
```

4. access to docker container of postgres
```
docker exec -it pg bash
```

5. goto psql commandline
```
psql --username postgres
```

6. copy sql script in `sqlscript.sql` and paste

7. exit the psql commandline and docker container
```
\q

exit
```

8. goto the main blockchain explorer file
```
cd ../../blockchain-explorer
```

9. start the blockchain explorer application
```
node main.js
```

10. goto the web browser and navigate to this url
```
http://localhost:3004
```