--
-- PostgreSQL database dump
--

\restrict 8DDL4f6rEo2zUAjIvcGpzAlfYmZsOamMxaCk5rg1J8clFRUQCZTsC6RwRhZ4Nzs

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: casos_prueba; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.casos_prueba (
    id integer NOT NULL,
    ejercicio_id integer,
    input text,
    output_esperado text
);


ALTER TABLE public.casos_prueba OWNER TO postgres;

--
-- Name: casos_prueba_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.casos_prueba_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.casos_prueba_id_seq OWNER TO postgres;

--
-- Name: casos_prueba_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.casos_prueba_id_seq OWNED BY public.casos_prueba.id;


--
-- Name: chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat (
    id integer NOT NULL,
    usuario_id integer,
    conversacion_id integer,
    mensaje text,
    respuesta text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chat OWNER TO postgres;

--
-- Name: chat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_id_seq OWNER TO postgres;

--
-- Name: chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_id_seq OWNED BY public.chat.id;


--
-- Name: conversaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversaciones (
    id integer NOT NULL,
    usuario_id integer,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nombre character varying(255)
);


ALTER TABLE public.conversaciones OWNER TO postgres;

--
-- Name: conversaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversaciones_id_seq OWNER TO postgres;

--
-- Name: conversaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversaciones_id_seq OWNED BY public.conversaciones.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgresql
--

CREATE TABLE public.documents (
    id bigint NOT NULL,
    topic_id bigint NOT NULL,
    title text NOT NULL,
    file_path text NOT NULL,
    file_type character varying(20) NOT NULL,
    level character varying(50),
    checksum text,
    processed boolean DEFAULT false NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO postgresql;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql
--

CREATE SEQUENCE public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO postgresql;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: ejercicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ejercicios (
    id integer NOT NULL,
    titulo character varying(150),
    descripcion text,
    dificultad character varying(20),
    topic_id integer,
    entrada text,
    salida text,
    requisitos text,
    ejemplos text,
    casos_prueba text
);


ALTER TABLE public.ejercicios OWNER TO postgres;

--
-- Name: ejercicios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ejercicios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ejercicios_id_seq OWNER TO postgres;

--
-- Name: ejercicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ejercicios_id_seq OWNED BY public.ejercicios.id;


--
-- Name: errores_detectados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.errores_detectados (
    id integer NOT NULL,
    nombre character varying(100),
    tipo character varying(50),
    descripcion text
);


ALTER TABLE public.errores_detectados OWNER TO postgres;

--
-- Name: errores_detectados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.errores_detectados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.errores_detectados_id_seq OWNER TO postgres;

--
-- Name: errores_detectados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.errores_detectados_id_seq OWNED BY public.errores_detectados.id;


--
-- Name: knowledge_chunks; Type: TABLE; Schema: public; Owner: postgresql
--

CREATE TABLE public.knowledge_chunks (
    id bigint NOT NULL,
    document_id bigint,
    topic_id bigint NOT NULL,
    source_type character varying(50) NOT NULL,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    embedding public.vector(768),
    level character varying(50),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.knowledge_chunks OWNER TO postgresql;

--
-- Name: knowledge_chunks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql
--

CREATE SEQUENCE public.knowledge_chunks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_chunks_id_seq OWNER TO postgresql;

--
-- Name: knowledge_chunks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql
--

ALTER SEQUENCE public.knowledge_chunks_id_seq OWNED BY public.knowledge_chunks.id;


--
-- Name: progreso_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progreso_usuario (
    id integer NOT NULL,
    usuario_id integer,
    topic_id integer,
    nivel integer,
    score integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.progreso_usuario OWNER TO postgres;

--
-- Name: progreso_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.progreso_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.progreso_usuario_id_seq OWNER TO postgres;

--
-- Name: progreso_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.progreso_usuario_id_seq OWNED BY public.progreso_usuario.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    nombre character varying(100),
    descripcion text,
    parent_id integer
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_id_seq OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: user_ejer; Type: TABLE; Schema: public; Owner: postgresql
--

CREATE TABLE public.user_ejer (
    user_id integer,
    ejer_id integer,
    envio text,
    envio_send_time date,
    id integer NOT NULL,
    estado integer
);


ALTER TABLE public.user_ejer OWNER TO postgresql;

--
-- Name: user_ejer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgresql
--

CREATE SEQUENCE public.user_ejer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_ejer_id_seq OWNER TO postgresql;

--
-- Name: user_ejer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresql
--

ALTER SEQUENCE public.user_ejer_id_seq OWNED BY public.user_ejer.id;


--
-- Name: user_errors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_errors (
    id integer NOT NULL,
    usuario_id integer,
    error_id integer,
    contador integer DEFAULT 1,
    last_seen timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_errors OWNER TO postgres;

--
-- Name: user_errors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_errors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_errors_id_seq OWNER TO postgres;

--
-- Name: user_errors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_errors_id_seq OWNED BY public.user_errors.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100),
    email character varying(150) NOT NULL,
    password_hash character varying(255),
    nivel character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    picture text,
    google_id character varying(255) NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: casos_prueba id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casos_prueba ALTER COLUMN id SET DEFAULT nextval('public.casos_prueba_id_seq'::regclass);


--
-- Name: chat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat ALTER COLUMN id SET DEFAULT nextval('public.chat_id_seq'::regclass);


--
-- Name: conversaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones ALTER COLUMN id SET DEFAULT nextval('public.conversaciones_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: ejercicios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios ALTER COLUMN id SET DEFAULT nextval('public.ejercicios_id_seq'::regclass);


--
-- Name: errores_detectados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errores_detectados ALTER COLUMN id SET DEFAULT nextval('public.errores_detectados_id_seq'::regclass);


--
-- Name: knowledge_chunks id; Type: DEFAULT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.knowledge_chunks ALTER COLUMN id SET DEFAULT nextval('public.knowledge_chunks_id_seq'::regclass);


--
-- Name: progreso_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_usuario ALTER COLUMN id SET DEFAULT nextval('public.progreso_usuario_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: user_ejer id; Type: DEFAULT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.user_ejer ALTER COLUMN id SET DEFAULT nextval('public.user_ejer_id_seq'::regclass);


--
-- Name: user_errors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_errors ALTER COLUMN id SET DEFAULT nextval('public.user_errors_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: casos_prueba casos_prueba_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casos_prueba
    ADD CONSTRAINT casos_prueba_pkey PRIMARY KEY (id);


--
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- Name: conversaciones conversaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: ejercicios ejercicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_pkey PRIMARY KEY (id);


--
-- Name: errores_detectados errores_detectados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errores_detectados
    ADD CONSTRAINT errores_detectados_pkey PRIMARY KEY (id);


--
-- Name: knowledge_chunks knowledge_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_pkey PRIMARY KEY (id);


--
-- Name: progreso_usuario progreso_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_usuario
    ADD CONSTRAINT progreso_usuario_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: user_ejer user_ejer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.user_ejer
    ADD CONSTRAINT user_ejer_pkey PRIMARY KEY (id);


--
-- Name: user_errors user_errors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_errors
    ADD CONSTRAINT user_errors_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_unique UNIQUE (google_id);


--
-- Name: idx_chunks_chunk_index; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_chunks_chunk_index ON public.knowledge_chunks USING btree (chunk_index);


--
-- Name: idx_chunks_content_fts; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_chunks_content_fts ON public.knowledge_chunks USING gin (to_tsvector('spanish'::regconfig, content));


--
-- Name: idx_chunks_document_id; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_chunks_document_id ON public.knowledge_chunks USING btree (document_id);


--
-- Name: idx_chunks_level; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_chunks_level ON public.knowledge_chunks USING btree (level);


--
-- Name: idx_chunks_source_type; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_chunks_source_type ON public.knowledge_chunks USING btree (source_type);


--
-- Name: idx_chunks_topic_id; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_chunks_topic_id ON public.knowledge_chunks USING btree (topic_id);


--
-- Name: idx_documents_checksum; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE UNIQUE INDEX idx_documents_checksum ON public.documents USING btree (checksum);


--
-- Name: idx_documents_level; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_documents_level ON public.documents USING btree (level);


--
-- Name: idx_documents_processed; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_documents_processed ON public.documents USING btree (processed);


--
-- Name: idx_documents_topic_id; Type: INDEX; Schema: public; Owner: postgresql
--

CREATE INDEX idx_documents_topic_id ON public.documents USING btree (topic_id);


--
-- Name: casos_prueba casos_prueba_ejercicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casos_prueba
    ADD CONSTRAINT casos_prueba_ejercicio_id_fkey FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicios(id);


--
-- Name: chat chat_conversacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_conversacion_id_fkey FOREIGN KEY (conversacion_id) REFERENCES public.conversaciones(id);


--
-- Name: chat chat_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: conversaciones conversaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: ejercicios ejercicios_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: knowledge_chunks fk_chunks_topic; Type: FK CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT fk_chunks_topic FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: documents fk_documents_topic; Type: FK CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_documents_topic FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: knowledge_chunks knowledge_chunks_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: progreso_usuario progreso_usuario_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_usuario
    ADD CONSTRAINT progreso_usuario_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: progreso_usuario progreso_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_usuario
    ADD CONSTRAINT progreso_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: topics topics_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.topics(id);


--
-- Name: user_ejer user_ejer_ejer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.user_ejer
    ADD CONSTRAINT user_ejer_ejer_id_fkey FOREIGN KEY (ejer_id) REFERENCES public.ejercicios(id);


--
-- Name: user_ejer user_ejer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgresql
--

ALTER TABLE ONLY public.user_ejer
    ADD CONSTRAINT user_ejer_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id);


--
-- Name: user_errors user_errors_error_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_errors
    ADD CONSTRAINT user_errors_error_id_fkey FOREIGN KEY (error_id) REFERENCES public.errores_detectados(id);


--
-- Name: user_errors user_errors_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_errors
    ADD CONSTRAINT user_errors_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 8DDL4f6rEo2zUAjIvcGpzAlfYmZsOamMxaCk5rg1J8clFRUQCZTsC6RwRhZ4Nzs

