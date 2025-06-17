import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConsultasChatbot = sequelize.define('consultas_chatbot', {
    idConsulta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true

    },
    consulta: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: new Date()

    },
    extra: {
        type: DataTypes.STRING(350)
    }
}, {
    timestamps: false
});

export default ConsultasChatbot;