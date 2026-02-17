import boto3
import json
import os

from rest_framework import viewsets,filters,mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.db.models.functions import TruncDate
from django_filters.rest_framework import DjangoFilterBackend

from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
    ):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend,filters.SearchFilter]
    filterset_fields = ['status', 'priority', 'category']
    search_fields = ['title', 'description']
    
    @action(detail=False, methods=['get'])
    def stats(self,request):
        """_summary_

        Args:
            request (_type_): _description_
        
        Returns:
            ggregated statistics using database-level aggregation.
        """
        
        total_tickets = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status='open').count()
        
        daily_counts = (
            Ticket.objects.annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
        )
        
        avg_tickets = daily_counts.aggregate(Avg('count'))['count__avg'] or 0
        
        priority_data = Ticket.objects.values('priority').annotate(count=Count('id'))
        priority_breakdown = {item['priority']: item['count'] for item in priority_data}
        
        category_data = Ticket.objects.values('category').annotate(count=Count('id'))
        category_breakdown = {item['category']: item['count'] for item in category_data}
        
        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'average_tickets_per_day': avg_tickets,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
        })
    @action(detail=False, methods=['post'])
    def classify(self, request):
        """_summary_

        Args:
            request (_type_): _description_

        Returns:
            LLM-based classification of ticket category and priority.
        """
        description = request.data.get('description')
        
        if not description:
            return Response({'error': 'Description is required for classification.'}, status=400)
        
        client = boto3.client(
            service_name = 'bedrock-runtime',
            region_name = os.getenv('AWS_REGION','ap-south-1')
        )
        
        prompt =f"""
        Classify the following support ticket description into one of these categories: 
        billing, technical, account, general.
        Also suggest a priority level: low, medium, high, critical. 
        
        Description: {description}
        
        Return ONLY a JSON object in this format:
        {{
            "category": "category_name",
            "priority": "priority_level"
        }}
        
        """
        
        try:
            model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
            response = client.converse(
                modelId = model_id,
                messages = [
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            )
            
            output_text = response['output']['message']['content'][0]['text']
            result = json.loads(output_text)
            
            return Response({
                "suggested_category": result.get('category'),
                "suggested_priority": result.get('priority')
            })
        except Exception as e:
            return Response({
                "suggested_category": None,
                "suggested_priority": None,
                "error": str(e)
            })