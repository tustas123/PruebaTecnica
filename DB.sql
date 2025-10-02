
DROP TABLE DENOMINACIONES CASCADE CONSTRAINTS;
DROP SEQUENCE DENOMINACIONES_SEQ;

CREATE SEQUENCE DENOMINACIONES_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE TABLE DENOMINACIONES (
    id NUMBER DEFAULT DENOMINACIONES_SEQ.NEXTVAL PRIMARY KEY,
    CANTIDAD NUMBER NOT NULL,
    DENOMINACION NUMBER(10,2) NOT NULL,
    TIPO VARCHAR2(10) NOT NULL  
    
);

INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 2, 1000, 'Billete');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 5, 500, 'Billete');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 10, 200, 'Billete');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 20, 100, 'Billete');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 30, 50, 'Billete');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 40, 20, 'Billete');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 50, 10, 'Moneda');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 100, 5, 'Moneda');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 200, 2, 'Moneda');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 300, 1, 'Moneda');
INSERT INTO denominaciones (id, cantidad, denominacion, tipo) VALUES (DENOMINACIONES_SEQ.NEXTVAL, 100, 0.5, 'Moneda');

COMMIT;


SELECT 'Total efectivo: $' || SUM(denominacion * cantidad) AS total_efectivo FROM denominaciones;

SELECT * FROM denominaciones;