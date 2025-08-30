#!/bin/bash

# Script de redémarrage des bots sur VPS
# Gère plusieurs bots avec PM2

echo "🔄 SCRIPT DE REDÉMARRAGE DES BOTS"
echo "=================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé. Installation...${NC}"
    npm install -g pm2
fi

# Menu de sélection
echo ""
echo "Que voulez-vous faire ?"
echo "1) Voir l'état de tous les bots"
echo "2) Redémarrer UN bot spécifique"
echo "3) Redémarrer TOUS les bots"
echo "4) Arrêter un bot"
echo "5) Démarrer un nouveau bot"
echo "6) Voir les logs d'un bot"
echo "7) Redémarrer le bot de CE projet uniquement"
echo ""
read -p "Votre choix (1-7): " choice

case $choice in
    1)
        echo -e "\n${GREEN}📊 État de tous les bots:${NC}"
        pm2 list
        ;;
    
    2)
        echo -e "\n${GREEN}📋 Liste des bots actifs:${NC}"
        pm2 list
        echo ""
        read -p "Entrez le nom ou l'ID du bot à redémarrer: " bot_name
        echo -e "${YELLOW}🔄 Redémarrage de $bot_name...${NC}"
        pm2 restart $bot_name
        echo -e "${GREEN}✅ Bot $bot_name redémarré${NC}"
        pm2 info $bot_name
        ;;
    
    3)
        echo -e "${YELLOW}🔄 Redémarrage de TOUS les bots...${NC}"
        pm2 restart all
        echo -e "${GREEN}✅ Tous les bots ont été redémarrés${NC}"
        pm2 list
        ;;
    
    4)
        echo -e "\n${GREEN}📋 Liste des bots actifs:${NC}"
        pm2 list
        echo ""
        read -p "Entrez le nom ou l'ID du bot à arrêter: " bot_name
        echo -e "${RED}⏹️  Arrêt de $bot_name...${NC}"
        pm2 stop $bot_name
        echo -e "${GREEN}✅ Bot $bot_name arrêté${NC}"
        ;;
    
    5)
        echo -e "\n${GREEN}🚀 Démarrage d'un nouveau bot${NC}"
        echo "Bots disponibles dans ce projet:"
        echo "  - bot.js (Bot de base)"
        echo "  - bot-webhook-fixed.js (Bot avec webhook)"
        echo "  - bot-webhook-production.js (Bot production)"
        echo "  - bot-mongodb.js (Bot avec MongoDB)"
        echo "  - bot-mongodb-webhook.js (Bot MongoDB + Webhook)"
        echo ""
        read -p "Nom du fichier bot à démarrer: " bot_file
        read -p "Nom pour identifier ce bot dans PM2: " bot_name
        
        # Vérifier si le fichier existe
        if [ -f "$bot_file" ]; then
            echo -e "${YELLOW}🚀 Démarrage de $bot_name...${NC}"
            pm2 start $bot_file --name $bot_name
            echo -e "${GREEN}✅ Bot $bot_name démarré${NC}"
            pm2 info $bot_name
        else
            echo -e "${RED}❌ Fichier $bot_file non trouvé${NC}"
        fi
        ;;
    
    6)
        echo -e "\n${GREEN}📋 Liste des bots:${NC}"
        pm2 list
        echo ""
        read -p "Entrez le nom ou l'ID du bot pour voir les logs: " bot_name
        echo -e "${GREEN}📜 Logs de $bot_name (Ctrl+C pour quitter):${NC}"
        pm2 logs $bot_name
        ;;
    
    7)
        echo -e "${YELLOW}🔄 Redémarrage du bot de ce projet...${NC}"
        
        # Déterminer quel bot est utilisé
        BOT_FILE=""
        if [ -f "bot-mongodb-webhook.js" ]; then
            BOT_FILE="bot-mongodb-webhook.js"
        elif [ -f "bot-webhook-fixed.js" ]; then
            BOT_FILE="bot-webhook-fixed.js"
        elif [ -f "bot.js" ]; then
            BOT_FILE="bot.js"
        fi
        
        if [ -n "$BOT_FILE" ]; then
            # Chercher si le bot est déjà en cours d'exécution
            BOT_NAME=$(pm2 list | grep $BOT_FILE | awk '{print $2}')
            
            if [ -n "$BOT_NAME" ]; then
                echo -e "${YELLOW}🔄 Redémarrage de $BOT_NAME ($BOT_FILE)...${NC}"
                pm2 restart $BOT_NAME
                echo -e "${GREEN}✅ Bot redémarré${NC}"
            else
                # Démarrer le bot s'il n'est pas déjà lancé
                echo -e "${YELLOW}🚀 Démarrage du bot $BOT_FILE...${NC}"
                pm2 start $BOT_FILE --name "idffull-bot"
                echo -e "${GREEN}✅ Bot démarré${NC}"
            fi
            
            # Afficher les infos
            sleep 2
            pm2 info "idffull-bot"
        else
            echo -e "${RED}❌ Aucun fichier bot trouvé dans ce projet${NC}"
        fi
        ;;
    
    *)
        echo -e "${RED}❌ Option invalide${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}💡 Commandes PM2 utiles:${NC}"
echo "  pm2 list              - Voir tous les bots"
echo "  pm2 logs [nom]        - Voir les logs"
echo "  pm2 restart [nom]     - Redémarrer un bot"
echo "  pm2 stop [nom]        - Arrêter un bot"
echo "  pm2 delete [nom]      - Supprimer un bot de PM2"
echo "  pm2 save              - Sauvegarder la config"
echo "  pm2 startup           - Démarrage automatique au boot"
echo ""