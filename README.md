# Create the test database

```
-- CREATE A UTF8 DATABASE

CREATE DATABASE '127.0.0.1/3050:C:\DBS\TEST_UTF8.fdb'
USER 'SYSDBA' PASSWORD 'masterkey'
PAGE_SIZE 16384
DEFAULT CHARACTER SET UTF8 COLLATION UTF8;

COMMIT WORK;


-- CREATE A ISO8859_1 DATABASE
CREATE DATABASE '127.0.0.1/3050:TEST_ISO8859_1.fdb'
USER 'SYSDBA' PASSWORD 'masterkey'
PAGE_SIZE 16384
DEFAULT CHARACTER SET ISO8859_1 COLLATION ISO8859_1;

COMMIT WORK;


```

Now let's create the structure

```

CREATE TABLE TEST_TABLE (
    T_TABLE  BIGINT NOT NULL,
    T_VALUE  BIGINT,
    T_MEMO   BLOB SUB_TYPE 1 SEGMENT SIZE 80,
    T_BLOB   BLOB SUB_TYPE 0 SEGMENT SIZE 80,
    T_MEMO2  BLOB SUB_TYPE 0 SEGMENT SIZE 16384
);


/******************************************************************************/
/****                             Primary keys                             ****/
/******************************************************************************/

ALTER TABLE TEST_TABLE ADD CONSTRAINT PK_TEST_TABLE PRIMARY KEY (T_TABLE);
```


Now let's fill it with some data
