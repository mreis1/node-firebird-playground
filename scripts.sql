
DROP TABLE TEST_TABLE;
CREATE TABLE TEST_TABLE (
    T_TABLE  BIGINT NOT NULL /* DOM_CLE_PRIMAIRE = BIGINT NOT NULL */,
    T_VALUE  BIGINT /* DOM_ENTIER = INTEGER DEFAULT 0 NOT NULL */,
    T_MEMO   BLOB SUB_TYPE 1 SEGMENT SIZE 80 /* DOM_MEMO = BLOB SUB_TYPE 1 SEGMENT SIZE 80 */,
    T_BLOB   BLOB SUB_TYPE 0 SEGMENT SIZE 80 /* DOM_BLOB = BLOB SUB_TYPE 0 SEGMENT SIZE 80 */,
    T_MEMO2  BLOB SUB_TYPE 0 SEGMENT SIZE 16384
);




/******************************************************************************/
/****                             Primary keys                             ****/
/******************************************************************************/

ALTER TABLE TEST_TABLE ADD CONSTRAINT PK_TEST_TABLE PRIMARY KEY (T_TABLE);
